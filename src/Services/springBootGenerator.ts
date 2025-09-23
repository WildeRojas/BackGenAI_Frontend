interface UMLClass {
  id: string;
  name: string;
  attributes: Array<{
    name: string;
    type: string;
    visibility: 'public' | 'private' | 'protected';
  }>;
  methods: Array<{
    name: string;
    returnType: string;
    parameters: Array<{ name: string; type: string }>;
    visibility: 'public' | 'private' | 'protected';
  }>;
  stereotype?: string;
}

interface UMLRelation {
  id: string;
  source: string;
  target: string;
  type: 'association' | 'inheritance' | 'aggregation' | 'composition' | 'dependency';
  sourceCardinality?: string;
  targetCardinality?: string;
  sourceLabel?: string;
  targetLabel?: string;
}

interface SpringBootProjectStructure {
  entities: string[];
  repositories: string[];
  services: string[];
  controllers: string[];
  applicationProperties: string;
  pomXml: string;
}

class SpringBootCodeGenerator {
  private classes: UMLClass[];
  private relations: UMLRelation[];
  
  constructor(classes: UMLClass[], relations: UMLRelation[]) {
    this.classes = classes;
    this.relations = relations;
  }

  // Mapeo de tipos UML a tipos Java
  private mapTypeToJava(umlType: string): string {
    const typeMap: { [key: string]: string } = {
      'String': 'String',
      'string': 'String',
      'int': 'Integer',
      'Integer': 'Integer',
      'double': 'Double',
      'Double': 'Double',
      'float': 'Float',
      'Float': 'Float',
      'boolean': 'Boolean',
      'Boolean': 'Boolean',
      'Date': 'LocalDateTime',
      'date': 'LocalDateTime',
      'long': 'Long',
      'Long': 'Long'
    };
    
    return typeMap[umlType] || 'String';
  }

  // Obtener anotaciones JPA según el tipo de relación
  private getRelationAnnotation(relation: UMLRelation, isSource: boolean): string {
    const { type, sourceCardinality, targetCardinality } = relation;
    
    switch (type) {
      case 'inheritance':
        return ''; // La herencia se maneja con @Entity
      
      case 'composition':
      case 'aggregation':
        if (sourceCardinality?.includes('*') && targetCardinality?.includes('1')) {
          return isSource ? '@ManyToOne\n    @JoinColumn(name = "' + relation.target.toLowerCase() + '_id")' : '@OneToMany(mappedBy = "' + relation.source.toLowerCase() + '", cascade = CascadeType.ALL)';
        }
        if (sourceCardinality?.includes('1') && targetCardinality?.includes('*')) {
          return isSource ? '@OneToMany(mappedBy = "' + relation.target.toLowerCase() + '", cascade = CascadeType.ALL)' : '@ManyToOne\n    @JoinColumn(name = "' + relation.source.toLowerCase() + '_id")';
        }
        return '@OneToOne';
      
      case 'association':
        if (sourceCardinality?.includes('*') && targetCardinality?.includes('*')) {
          return isSource ? '@ManyToMany' : '@ManyToMany(mappedBy = "' + relation.source.toLowerCase() + 's")';
        }
        if (sourceCardinality?.includes('*') && targetCardinality?.includes('1')) {
          return isSource ? '@ManyToOne' : '@OneToMany(mappedBy = "' + relation.source.toLowerCase() + '")';
        }
        if (sourceCardinality?.includes('1') && targetCardinality?.includes('*')) {
          return isSource ? '@OneToMany(mappedBy = "' + relation.target.toLowerCase() + '")' : '@ManyToOne';
        }
        return '@OneToOne';
      
      default:
        return '';
    }
  }

  // Generar entidades JPA
  generateEntities(): string[] {
    return this.classes.map(umlClass => {
      const className = umlClass.name;
      const packageName = 'com.example.demo.entity';
      
      // Encontrar relaciones para esta clase
      const classRelations = this.relations.filter(rel => 
        rel.source === umlClass.id || rel.target === umlClass.id
      );

      // Verificar si esta clase extiende de otra (herencia)
      const inheritanceRel = classRelations.find(rel => 
        rel.type === 'inheritance' && rel.source === umlClass.id
      );
      const parentClass = inheritanceRel ? 
        this.classes.find(c => c.id === inheritanceRel.target)?.name : null;

      let entityCode = `package ${packageName};\n\n`;
      
      // Imports
      entityCode += 'import jakarta.persistence.*;\n';
      entityCode += 'import java.time.LocalDateTime;\n';
      entityCode += 'import java.util.List;\n';
      entityCode += 'import java.util.Set;\n';
      if (classRelations.some(rel => rel.type === 'composition' || rel.type === 'aggregation')) {
        entityCode += 'import com.fasterxml.jackson.annotation.JsonManagedReference;\n';
        entityCode += 'import com.fasterxml.jackson.annotation.JsonBackReference;\n';
      }
      entityCode += '\n';

      // Clase
      entityCode += '@Entity\n';
      entityCode += `@Table(name = "${className.toLowerCase()}")\n`;
      if (parentClass) {
        entityCode += `public class ${className} extends ${parentClass} {\n\n`;
      } else {
        entityCode += `public class ${className} {\n\n`;
        
        // ID automático si no hay herencia
        entityCode += '    @Id\n';
        entityCode += '    @GeneratedValue(strategy = GenerationType.IDENTITY)\n';
        entityCode += '    private Long id;\n\n';
      }

      // Atributos
      umlClass.attributes.forEach(attr => {
        const javaType = this.mapTypeToJava(attr.type);
        entityCode += `    @Column(name = "${attr.name.toLowerCase()}")\n`;
        entityCode += `    private ${javaType} ${attr.name};\n\n`;
      });

      // Relaciones como atributos
      classRelations.forEach(relation => {
        const isSource = relation.source === umlClass.id;
        const relatedClass = this.classes.find(c => c.id === (isSource ? relation.target : relation.source));
        
        if (relatedClass && relation.type !== 'inheritance' && relation.type !== 'dependency') {
          const annotation = this.getRelationAnnotation(relation, isSource);
          const fieldName = relatedClass.name.toLowerCase();
          
          if (annotation.includes('Many')) {
            const collectionType = annotation.includes('ManyToMany') ? 'Set' : 'List';
            entityCode += `    ${annotation}\n`;
            if (annotation.includes('JsonManagedReference') || annotation.includes('OneToMany')) {
              entityCode += '    @JsonManagedReference\n';
            }
            entityCode += `    private ${collectionType}<${relatedClass.name}> ${fieldName}s;\n\n`;
          } else {
            entityCode += `    ${annotation}\n`;
            if (annotation.includes('ManyToOne')) {
              entityCode += '    @JsonBackReference\n';
            }
            entityCode += `    private ${relatedClass.name} ${fieldName};\n\n`;
          }
        }
      });

      // Constructor sin parámetros
      entityCode += `    public ${className}() {}\n\n`;

      // Constructor con parámetros
      if (umlClass.attributes.length > 0) {
        const params = umlClass.attributes.map(attr => 
          `${this.mapTypeToJava(attr.type)} ${attr.name}`
        ).join(', ');
        
        entityCode += `    public ${className}(${params}) {\n`;
        umlClass.attributes.forEach(attr => {
          entityCode += `        this.${attr.name} = ${attr.name};\n`;
        });
        entityCode += '    }\n\n';
      }

      // Getters y Setters para ID si no hay herencia
      if (!parentClass) {
        entityCode += '    public Long getId() {\n';
        entityCode += '        return id;\n';
        entityCode += '    }\n\n';
        entityCode += '    public void setId(Long id) {\n';
        entityCode += '        this.id = id;\n';
        entityCode += '    }\n\n';
      }

      // Getters y Setters para atributos
      umlClass.attributes.forEach(attr => {
        const javaType = this.mapTypeToJava(attr.type);
        const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
        
        entityCode += `    public ${javaType} get${capitalizedName}() {\n`;
        entityCode += `        return ${attr.name};\n`;
        entityCode += '    }\n\n';
        
        entityCode += `    public void set${capitalizedName}(${javaType} ${attr.name}) {\n`;
        entityCode += `        this.${attr.name} = ${attr.name};\n`;
        entityCode += '    }\n\n';
      });

      // Getters y Setters para relaciones
      classRelations.forEach(relation => {
        const isSource = relation.source === umlClass.id;
        const relatedClass = this.classes.find(c => c.id === (isSource ? relation.target : relation.source));
        
        if (relatedClass && relation.type !== 'inheritance' && relation.type !== 'dependency') {
          const fieldName = relatedClass.name.toLowerCase();
          const capitalizedName = relatedClass.name;
          const annotation = this.getRelationAnnotation(relation, isSource);
          
          if (annotation.includes('Many')) {
            const collectionType = annotation.includes('ManyToMany') ? 'Set' : 'List';
            entityCode += `    public ${collectionType}<${relatedClass.name}> get${capitalizedName}s() {\n`;
            entityCode += `        return ${fieldName}s;\n`;
            entityCode += '    }\n\n';
            
            entityCode += `    public void set${capitalizedName}s(${collectionType}<${relatedClass.name}> ${fieldName}s) {\n`;
            entityCode += `        this.${fieldName}s = ${fieldName}s;\n`;
            entityCode += '    }\n\n';
          } else {
            entityCode += `    public ${relatedClass.name} get${capitalizedName}() {\n`;
            entityCode += `        return ${fieldName};\n`;
            entityCode += '    }\n\n';
            
            entityCode += `    public void set${capitalizedName}(${relatedClass.name} ${fieldName}) {\n`;
            entityCode += `        this.${fieldName} = ${fieldName};\n`;
            entityCode += '    }\n\n';
          }
        }
      });

      entityCode += '}';
      
      return entityCode;
    });
  }

  // Generar repositorios JPA
  generateRepositories(): string[] {
    return this.classes.map(umlClass => {
      const className = umlClass.name;
      const packageName = 'com.example.demo.repository';
      
      let repoCode = `package ${packageName};\n\n`;
      repoCode += 'import org.springframework.data.jpa.repository.JpaRepository;\n';
      repoCode += 'import org.springframework.stereotype.Repository;\n';
      repoCode += `import com.example.demo.entity.${className};\n\n`;
      
      repoCode += '@Repository\n';
      repoCode += `public interface ${className}Repository extends JpaRepository<${className}, Long> {\n`;
      
      // Métodos de búsqueda personalizados basados en atributos
      umlClass.attributes.forEach(attr => {
        const javaType = this.mapTypeToJava(attr.type);
        const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
        
        if (javaType === 'String') {
          repoCode += `    ${className} findBy${capitalizedName}(${javaType} ${attr.name});\n`;
          repoCode += `    List<${className}> findBy${capitalizedName}Containing(${javaType} ${attr.name});\n`;
        } else {
          repoCode += `    ${className} findBy${capitalizedName}(${javaType} ${attr.name});\n`;
        }
      });
      
      repoCode += '}';
      
      return repoCode;
    });
  }

  // Generar servicios
  generateServices(): string[] {
    return this.classes.map(umlClass => {
      const className = umlClass.name;
      const packageName = 'com.example.demo.service';
      
      let serviceCode = `package ${packageName};\n\n`;
      serviceCode += 'import org.springframework.beans.factory.annotation.Autowired;\n';
      serviceCode += 'import org.springframework.stereotype.Service;\n';
      serviceCode += 'import java.util.List;\n';
      serviceCode += 'import java.util.Optional;\n';
      serviceCode += `import com.example.demo.entity.${className};\n`;
      serviceCode += `import com.example.demo.repository.${className}Repository;\n\n`;
      
      serviceCode += '@Service\n';
      serviceCode += `public class ${className}Service {\n\n`;
      
      serviceCode += '    @Autowired\n';
      serviceCode += `    private ${className}Repository ${className.toLowerCase()}Repository;\n\n`;
      
      // Métodos CRUD básicos
      serviceCode += `    public List<${className}> findAll() {\n`;
      serviceCode += `        return ${className.toLowerCase()}Repository.findAll();\n`;
      serviceCode += '    }\n\n';
      
      serviceCode += `    public Optional<${className}> findById(Long id) {\n`;
      serviceCode += `        return ${className.toLowerCase()}Repository.findById(id);\n`;
      serviceCode += '    }\n\n';
      
      serviceCode += `    public ${className} save(${className} ${className.toLowerCase()}) {\n`;
      serviceCode += `        return ${className.toLowerCase()}Repository.save(${className.toLowerCase()});\n`;
      serviceCode += '    }\n\n';
      
      serviceCode += '    public void deleteById(Long id) {\n';
      serviceCode += `        ${className.toLowerCase()}Repository.deleteById(id);\n`;
      serviceCode += '    }\n\n';
      
      // Métodos personalizados basados en atributos
      umlClass.attributes.forEach(attr => {
        const javaType = this.mapTypeToJava(attr.type);
        const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
        
        if (javaType === 'String') {
          serviceCode += `    public ${className} findBy${capitalizedName}(${javaType} ${attr.name}) {\n`;
          serviceCode += `        return ${className.toLowerCase()}Repository.findBy${capitalizedName}(${attr.name});\n`;
          serviceCode += '    }\n\n';
          
          serviceCode += `    public List<${className}> findBy${capitalizedName}Containing(${javaType} ${attr.name}) {\n`;
          serviceCode += `        return ${className.toLowerCase()}Repository.findBy${capitalizedName}Containing(${attr.name});\n`;
          serviceCode += '    }\n\n';
        } else {
          serviceCode += `    public ${className} findBy${capitalizedName}(${javaType} ${attr.name}) {\n`;
          serviceCode += `        return ${className.toLowerCase()}Repository.findBy${capitalizedName}(${attr.name});\n`;
          serviceCode += '    }\n\n';
        }
      });
      
      serviceCode += '}';
      
      return serviceCode;
    });
  }

  // Generar controladores REST
  generateControllers(): string[] {
    return this.classes.map(umlClass => {
      const className = umlClass.name;
      const packageName = 'com.example.demo.controller';
      
      let controllerCode = `package ${packageName};\n\n`;
      controllerCode += 'import org.springframework.beans.factory.annotation.Autowired;\n';
      controllerCode += 'import org.springframework.http.ResponseEntity;\n';
      controllerCode += 'import org.springframework.web.bind.annotation.*;\n';
      controllerCode += 'import java.util.List;\n';
      controllerCode += 'import java.util.Optional;\n';
      controllerCode += `import com.example.demo.entity.${className};\n`;
      controllerCode += `import com.example.demo.service.${className}Service;\n\n`;
      
      controllerCode += '@RestController\n';
      controllerCode += `@RequestMapping("/api/${className.toLowerCase()}s")\n`;
      controllerCode += '@CrossOrigin(origins = "*")\n';
      controllerCode += `public class ${className}Controller {\n\n`;
      
      controllerCode += '    @Autowired\n';
      controllerCode += `    private ${className}Service ${className.toLowerCase()}Service;\n\n`;
      
      // GET todos
      controllerCode += '    @GetMapping\n';
      controllerCode += `    public List<${className}> getAll${className}s() {\n`;
      controllerCode += `        return ${className.toLowerCase()}Service.findAll();\n`;
      controllerCode += '    }\n\n';
      
      // GET por ID
      controllerCode += '    @GetMapping("/{id}")\n';
      controllerCode += `    public ResponseEntity<${className}> get${className}ById(@PathVariable Long id) {\n`;
      controllerCode += `        Optional<${className}> ${className.toLowerCase()} = ${className.toLowerCase()}Service.findById(id);\n`;
      controllerCode += `        return ${className.toLowerCase()}.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());\n`;
      controllerCode += '    }\n\n';
      
      // POST crear
      controllerCode += '    @PostMapping\n';
      controllerCode += `    public ${className} create${className}(@RequestBody ${className} ${className.toLowerCase()}) {\n`;
      controllerCode += `        return ${className.toLowerCase()}Service.save(${className.toLowerCase()});\n`;
      controllerCode += '    }\n\n';
      
      // PUT actualizar
      controllerCode += '    @PutMapping("/{id}")\n';
      controllerCode += `    public ResponseEntity<${className}> update${className}(@PathVariable Long id, @RequestBody ${className} ${className.toLowerCase()}) {\n`;
      controllerCode += `        if (${className.toLowerCase()}Service.findById(id).isPresent()) {\n`;
      controllerCode += `            ${className.toLowerCase()}.setId(id);\n`;
      controllerCode += `            return ResponseEntity.ok(${className.toLowerCase()}Service.save(${className.toLowerCase()}));\n`;
      controllerCode += '        } else {\n';
      controllerCode += '            return ResponseEntity.notFound().build();\n';
      controllerCode += '        }\n';
      controllerCode += '    }\n\n';
      
      // DELETE
      controllerCode += '    @DeleteMapping("/{id}")\n';
      controllerCode += `    public ResponseEntity<Void> delete${className}(@PathVariable Long id) {\n`;
      controllerCode += `        if (${className.toLowerCase()}Service.findById(id).isPresent()) {\n`;
      controllerCode += `            ${className.toLowerCase()}Service.deleteById(id);\n`;
      controllerCode += '            return ResponseEntity.ok().build();\n';
      controllerCode += '        } else {\n';
      controllerCode += '            return ResponseEntity.notFound().build();\n';
      controllerCode += '        }\n';
      controllerCode += '    }\n\n';
      
      controllerCode += '}';
      
      return controllerCode;
    });
  }

  // Generar application.properties
  generateApplicationProperties(): string {
    return `# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/demo_db
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080

# Logging Configuration
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE`;
  }

  // Generar pom.xml
  generatePomXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>demo</name>
	<description>Demo project for Spring Boot generated from UML</description>
	<properties>
		<java.version>17</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>com.fasterxml.jackson.core</groupId>
			<artifactId>jackson-databind</artifactId>
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

  // Método principal para generar todo el proyecto
  generateSpringBootProject(): SpringBootProjectStructure {
    return {
      entities: this.generateEntities(),
      repositories: this.generateRepositories(),
      services: this.generateServices(),
      controllers: this.generateControllers(),
      applicationProperties: this.generateApplicationProperties(),
      pomXml: this.generatePomXml()
    };
  }
}

// Función helper para descargar archivos
export const downloadFile = (content: string, filename: string, contentType = 'text/plain') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Función helper para descargar como ZIP (requiere JSZip)
export const downloadAsZip = async (files: { [filename: string]: string }, zipName: string) => {
  // Esta función requiere la librería JSZip
  // npm install jszip
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Crear estructura de carpetas
    const srcMain = zip.folder('src/main');
    const javaFolder = srcMain?.folder('java/com/example/demo');
    const resourcesFolder = srcMain?.folder('resources');

    // Agregar archivos Java
    Object.entries(files).forEach(([filename, content]) => {
      if (filename.endsWith('.java')) {
        const folderMap: { [key: string]: unknown } = {
          'Entity': javaFolder?.folder('entity'),
          'Repository': javaFolder?.folder('repository'),
          'Service': javaFolder?.folder('service'),
          'Controller': javaFolder?.folder('controller')
        };

        const folderType = Object.keys(folderMap).find(type => filename.includes(type));
        const targetFolder = folderType ? folderMap[folderType] as { file: (name: string, content: string) => void } | null : javaFolder;
        
        targetFolder?.file(filename, content);
      } else if (filename === 'application.properties') {
        resourcesFolder?.file(filename, content);
      } else if (filename === 'pom.xml') {
        zip.file(filename, content);
      }
    });

    // Generar y descargar ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating ZIP file:', error);
    alert('Error generating ZIP file. JSZip library may not be installed.');
  }
};

export { SpringBootCodeGenerator };
export type { UMLClass, UMLRelation, SpringBootProjectStructure };