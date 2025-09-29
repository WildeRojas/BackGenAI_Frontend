import JSZip from "jszip"
import { saveAs } from "file-saver"
import type {
  ProyectoVersionContenido,
  UMLAttribute,
  UMLClass,
  UMLRelation
} from "../Interfaces/proyectos"


type CanvasAttrLoose = {
  nombre?: string;
  name?: string;
  tipo?: string;
  type?: string;
};

type CanvasClassLoose = {
  id?: string;
  nombre?: string;
  name?: string;
  atributos?: CanvasAttrLoose[];
  attributes?: CanvasAttrLoose[];
  position?: { x: number; y: number };
};


const JAVA_RESERVED = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue",
  "default", "do", "double", "else", "enum", "extends", "final", "finally", "float", "for", "goto", "if",
  "implements", "import", "instanceof", "int", "interface", "long", "native", "new", "package", "private",
  "protected", "public", "return", "short", "static", "strictfp", "super", "switch", "synchronized", "this",
  "throw", "throws", "transient", "try", "void", "volatile", "while", "true", "false", "null"
]);

// Normaliza el nombre de clase (acepta nombre|name)
function readClassName<T extends CanvasClassLoose>(c: T): string {
  const raw = (c?.nombre ?? c?.name ?? "Clase").toString();
  return raw.trim();
}

// Normaliza el array de atributos (acepta atributos|attributes y nombre|name, tipo|type)
export function readAttributes<T extends CanvasClassLoose>(
  c: T
): Array<Pick<UMLAttribute, "nombre" | "tipo">> {
  const list: CanvasAttrLoose[] = (c?.atributos ?? c?.attributes ?? []) as CanvasAttrLoose[];
  return list.map((a, i) => ({
    nombre: (a?.nombre ?? a?.name ?? `attr${i + 1}`) as string,
    tipo: (a?.tipo ?? a?.type ?? "string") as string,
  }));
}

function getPomXml(projectName: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>${projectName}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${projectName}</name>
    <description>Proyecto generado automáticamente</description>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <!-- Web: Controladores REST -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- JPA: ORM y persistencia -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <!-- Driver de base de datos H2 (EMBEDDED) -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <!-- Driver de base de datos PostgreSQL (opcional, solo si usas Postgres) -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <!-- Test (opcional) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`;
}

function getApplicationJava(packageName: string, appClassName: string) {
  return `package ${packageName};
  
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${appClassName} {
    public static void main(String[] args) {
        SpringApplication.run(${appClassName}.class, args);
    }
}`.trim();
}

function getApplicationProperties(appName: string = "demo", port: number = 8080): string {
  return `spring.application.name=${appName}
server.port=${port}

spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
`;
}

// Mapear tipos de atributos de frontend a tipos Java
export function mapTypeToJava(frontendType: string): "String" | "Integer" | "Double" | "Boolean" | "LocalDate" | "String" {
  const typeMap: Record<string, "String" | "Integer" | "Double" | "Boolean" | "LocalDate"> = {
    string: "String",
    Int: "Integer",
    float: "Double",
    boolean: "Boolean",
    date: "LocalDate",
  };
  return typeMap[frontendType] ?? "String";
}

function capFirst(s: string) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function lcFirst(s: string) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

type Cardinal = "1..1" | "0..1" | "1..*" | "0..*";
function parseCard(card?: string) {
  const clean = (card || "1..1").replace(/\s/g, "") as Cardinal;
  const [minStr, maxStr] = clean.split("..");
  const min = minStr === "0" ? 0 : 1;
  const many = maxStr === "*";
  const one = maxStr === "1";
  return { raw: clean, min, many, one };
}

function sanitizeJavaIdentifier(raw: string, fallbackPrefix = "attr", index = 1): string {
  let s = (raw ?? "").trim().replace(/[^\p{L}\p{N}_$]/gu, "");
  if (!s) s = `${fallbackPrefix}${index}`;
  // no iniciar con dígito
  if (/^\d/.test(s)) s = "_" + s;
  // minúscula inicial por convención
  s = lcFirst(s);
  // evitar reservadas
  if (JAVA_RESERVED.has(s)) s = `${s}_`;
  return s;
}

function sanitizeClassName(raw: string): string {
  let s = (raw ?? "").trim().replace(/[^\p{L}\p{N}_$]/gu, "");
  if (!s) s = "Clase";
  s = capFirst(s);
  if (JAVA_RESERVED.has(lcFirst(s))) s = s + "_";
  return s;
}

function simplePlural(s: string) {
  return s.endsWith("s") ? s : s + "s";
}

function inferJpaRelation(
  relation: UMLRelation
): { kind: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_ONE" | "MANY_TO_MANY"; owner: "source" | "target" } {
  const src = parseCard(relation.sourceCardinality);
  const tgt = parseCard(relation.targetCardinality);

  if (src.many && tgt.many) return { kind: "MANY_TO_MANY", owner: "source" };
  if (src.many && tgt.one) return { kind: "MANY_TO_ONE", owner: "source" };
  if (src.one && tgt.many) return { kind: "ONE_TO_MANY", owner: "target" };
  return { kind: "ONE_TO_ONE", owner: "source" };
}

// Generar imports necesarios basados en los tipos usados
function generateImports(umlClass: UMLClass, relations: UMLRelation[]): string[] {
  const imports = new Set<string>();
  imports.add("import jakarta.persistence.*;");

  // tipos de atributos
  if (umlClass.atributos.some(a => mapTypeToJava(a.tipo) === "LocalDate")) {
    imports.add("import java.time.LocalDate;");
  }

  // relaciones: solo importo colecciones si esta clase las va a declarar
  for (const r of relations) {
    const participates = (r.source === umlClass.id || r.target === umlClass.id);
    if (!participates) continue;
    if (r.type === "inheritance") continue;

    const iAmSource = r.source === umlClass.id;
    const info = inferJpaRelation(r);
    const iAmOwner = (info.owner === (iAmSource ? "source" : "target"));

    if (info.kind === "MANY_TO_MANY" && iAmOwner) {
      imports.add("import java.util.Set;");
      imports.add("import java.util.HashSet;");
    }
  }

  return Array.from(imports).sort();
}

// Generar anotaciones JPA para relaciones
function generateRelationAnnotations(
  relation: UMLRelation,
  isSource: boolean,
  targetClassName: string,
  classes: UMLClass[]
): string {
  if (relation.type === "inheritance") return "";

  const src = parseCard(relation.sourceCardinality);
  const tgt = parseCard(relation.targetCardinality);
  const info = inferJpaRelation(relation);
  const currentIsOwner = info.owner === (isSource ? "source" : "target");
  const fieldName = lcFirst(targetClassName);

  if (info.kind === "ONE_TO_ONE") {
    if (!currentIsOwner) return "";
    const optional = (src.min === 0 || tgt.min === 0) ? "true" : "false";
    return `@OneToOne(optional = ${optional})\n  @JoinColumn(name = "${fieldName}_id")`;
  }

  if (info.kind === "MANY_TO_ONE" || info.kind === "ONE_TO_MANY") {
    if (!currentIsOwner) return "";
    const oneSide = isSource ? tgt : src;
    const optional = oneSide.min === 0 ? "true" : "false";
    return `@ManyToOne(optional = ${optional})\n  @JoinColumn(name = "${fieldName}_id")`;
  }

  if (info.kind === "MANY_TO_MANY") {
    if (!currentIsOwner) return "";
    const currentClassName =
      classes.find(c => (isSource ? c.id === relation.source : c.id === relation.target))?.nombre || "Current";
    const joinTable = `${lcFirst(currentClassName)}_${lcFirst(targetClassName)}`;
    return `@ManyToMany\n  @JoinTable(\n    name = "${joinTable}",\n    joinColumns = @JoinColumn(name = "${lcFirst(currentClassName)}_id"),\n    inverseJoinColumns = @JoinColumn(name = "${fieldName}_id")\n  )`;
  }

  return "";
}

// Generar tipo de campo para relación
function generateRelationFieldType(
  relation: UMLRelation,
  isSource: boolean,
  targetClassName: string,
  _classes: UMLClass[]
): string {
  if (relation.type === "inheritance") return "";

  const info = inferJpaRelation(relation);
  const currentIsOwner = info.owner === (isSource ? "source" : "target");
  const fieldName = lcFirst(targetClassName);

  if ((info.kind === "ONE_TO_ONE" || info.kind === "MANY_TO_ONE" || info.kind === "ONE_TO_MANY") && currentIsOwner) {
    return `private ${targetClassName} ${fieldName};`;
  }

  if (info.kind === "MANY_TO_MANY" && currentIsOwner) {
    return `private Set<${targetClassName}> ${fieldName}Set = new HashSet<>();`;
  }

  return "";
}


function generateAttributeFields(umlClass: UMLClass): { fields: string[]; usedNames: string[] } {
  const fields: string[] = [];
  const used: string[] = [];

  const attrs = readAttributes(umlClass);

  attrs.forEach((a, idx) => {
    const javaType = mapTypeToJava(a.tipo);
    let name = sanitizeJavaIdentifier(a.nombre, "attr", idx + 1);

    while (used.includes(name) || name === "id") name = name + "_";
    used.push(name);

    fields.push(`private ${javaType} ${name};`);
  });

  return { fields, usedNames: used };
}

function getterSetterFor(fieldType: string, fieldName: string): string {
  // boolean → isX / setX; resto → getX / setX
  const cap = capFirst(fieldName);
  const paramName = fieldName === "id" ? "newId" : fieldName; // evitar conflicto de nombres
  
  if (fieldType === "boolean" || fieldType === "Boolean") {
    return `public ${fieldType} is${cap}() { return this.${fieldName}; }\n\n  public void set${cap}(${fieldType} ${paramName}) { this.${fieldName} = ${paramName}; }`;
  }
  return `public ${fieldType} get${cap}() { return this.${fieldName}; }\n\n  public void set${cap}(${fieldType} ${paramName}) { this.${fieldName} = ${paramName}; }`;
}


function getEntityJava(
  umlClass: UMLClass,
  relations: UMLRelation[],
  allClasses: UMLClass[],
  packageName: string = "com.example",
  useLombok: boolean = false
): string {
  const className = sanitizeClassName(readClassName(umlClass));
  const myRelations = relations.filter(r => r.source === umlClass.id || r.target === umlClass.id);
  const imports = generateImports(umlClass, myRelations);
  if (useLombok) imports.unshift("import lombok.*;");

  const { fields: attrFields, usedNames } = generateAttributeFields(umlClass);

  const relationBlocks: string[] = [];
  const relationFieldsInfo: Array<{ type: string; name: string }> = [];

  for (const r of myRelations) {
    const isSource = r.source === umlClass.id;
    const otherId = isSource ? r.target : r.source;
    const other = allClasses.find(c => c.id === otherId);
    if (!other) continue;

    const ann = generateRelationAnnotations(r, isSource, other.nombre, allClasses);
    const field = generateRelationFieldType(r, isSource, other.nombre, allClasses);
    if (ann && field) {
      relationBlocks.push(`${ann}\n  ${field}`);
      const m = field.match(/private\s+([A-Za-z0-9_<>[\]]+)\s+([a-zA-Z0-9_]+);/);
      if (m) relationFieldsInfo.push({ type: m[1], name: m[2] });
    }
  }

  const methods: string[] = [];
  if (!useLombok) {
    // Getter y setter para ID
    methods.push(getterSetterFor("Long", "id"));
    
    // Getters y setters para atributos normales
    const attrs = readAttributes(umlClass);
    attrs.forEach((a, idx) => {
      const javaType = mapTypeToJava(a.tipo);
      const fieldName = usedNames[idx];
      methods.push(getterSetterFor(javaType, fieldName));
    });
    
    // Getters y setters para relaciones
    relationFieldsInfo.forEach(f => {
      methods.push(getterSetterFor(f.type, f.name));
    });
  }

  const lombokAnn = useLombok ? "@Getter\n@Setter\n@NoArgsConstructor" : "";

  return `
package ${packageName}.entities;

${imports.join("\n")}

${lombokAnn}
@Entity
@Table(name = "${lcFirst(className)}")
public class ${className} {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  ${attrFields.join("\n  ")}${attrFields.length && relationBlocks.length ? "\n\n  " : attrFields.length ? "\n" : ""}${relationBlocks.join("\n\n  ")}

  ${!useLombok ? `\n  // --- Constructores ---\n  public ${className}() {}\n\n  // --- Getters y Setters ---\n  ${methods.join("\n\n  ")}` : ""}
}
`.trim();
}

// Generar Repository JPA
function getRepositoryJava(className: string, packageName: string = "com.example"): string {
  const E = sanitizeClassName(className);
  return `
  package ${packageName}.repositories;

  import ${packageName}.entities.${E};
  import org.springframework.data.jpa.repository.JpaRepository;
  import org.springframework.stereotype.Repository;

  @Repository
  public interface ${E}Repository extends JpaRepository<${E}, Long> {
  }
  `.trim();
}

// Generar Service
function getServiceJava(className: string, packageName: string = "com.example"): string {
  const E = sanitizeClassName(className);
  const e = lcFirst(E);

  return `
  package ${packageName}.services;

  import ${packageName}.entities.${E};
  import ${packageName}.repositories.${E}Repository;
  import org.springframework.stereotype.Service;

  import java.util.List;

  @Service
  public class ${E}Service {
    private final ${E}Repository repository;

    public ${E}Service(${E}Repository repository) {
      this.repository = repository;
    }

    public List<${E}> findAll() {
      return repository.findAll();
    }

    public ${E} findById(Long id) {
      return repository.findById(id).orElse(null);
    }

    public ${E} create(${E} ${e}) {
      return repository.save(${e});
    }

    public ${E} update(Long id, ${E} ${e}) {
      ${e}.setId(id);
      return repository.save(${e});
    }

    public void delete(Long id) {
      repository.deleteById(id);
    }
  }
  `.trim();
}

// Generar Controller REST
function getControllerJava(
  className: string, 
  packageName: string = "com.example",
  apiBasePath: string = "/api"
): string {
  const E = sanitizeClassName(className);
  const e = lcFirst(E);
  const pluralPath = simplePlural(e).toLowerCase();

  return `
  package ${packageName}.controllers;

  import ${packageName}.entities.${E};
  import ${packageName}.services.${E}Service;
  import org.springframework.web.bind.annotation.*;

  import java.util.List;

  @RestController
  @RequestMapping("${apiBasePath}/${pluralPath}")
  public class ${E}Controller {
    private final ${E}Service service;

    public ${E}Controller(${E}Service service) {
      this.service = service;
    }

    @GetMapping
    public List<${E}> List(){
      return service.findAll();
    }

    @GetMapping("/{id}")
    public ${E} get(@PathVariable Long id) {
      return service.findById(id);
    }

    @PostMapping
    public ${E} create(@RequestBody ${E} ${e}) {
      return  service.create(${e});
    }

    @PutMapping("/{id}")
    public ${E} update(@PathVariable Long id, @RequestBody ${E} ${e}) {
      return service.update(id, ${e});
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
      service.delete(id);
    }
  }
  `.trim();
}

export const SpringBootCodeGenerator = async (
  nombreProyecto: string = "demo-project",
  contenidoDiagrama?: ProyectoVersionContenido
) => {
  if (!contenidoDiagrama) throw new Error("contenidoDiagrama es requerido");
  const classes = contenidoDiagrama.classes ?? [];
  const relations = contenidoDiagrama.relations ?? [];

  const zip = new JSZip();
  const root = sanitizeClassName(nombreProyecto).replace(/\s+/g, "-");

  // pom.xml
  zip.file(`${root}/pom.xml`, getPomXml(root));

  // Application.java
  const packageName = "com.example";
  const appClassName = sanitizeClassName(root) + "Application";
  const javaRoot = `${root}/src/main/java/${packageName.replace(/\./g, "/")}`;
  const repostPath = `${javaRoot}/repositories`;
  const servicePath = `${javaRoot}/services`;
  const controllerPath = `${javaRoot}/controllers`;

  zip.file(`${javaRoot}/${appClassName}.java`, getApplicationJava(packageName, appClassName));

  // Entities
  const entitiesPath = `${javaRoot}/entities`;
  for (const c of classes) {
    const code = getEntityJava(c, relations, classes, packageName);
    const fileName = `${sanitizeClassName(c.nombre)}.java`;
    const repo = getRepositoryJava(c.nombre, packageName);
    const svc = getServiceJava(c.nombre, packageName);
    const ctrl = getControllerJava(c.nombre, packageName);

    zip.file(`${entitiesPath}/${fileName}`, code);
    zip.file(`${repostPath}/${sanitizeClassName(c.nombre)}Repository.java`, repo);
    zip.file(`${servicePath}/${sanitizeClassName(c.nombre)}Service.java`, svc);
    zip.file(`${controllerPath}/${sanitizeClassName(c.nombre)}Controller.java`, ctrl);
  }

  // resources
  const resourcesPath = `${root}/src/main/resources`;
  zip.file(`${resourcesPath}/application.properties`, getApplicationProperties(root));

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${root}.zip`);
};