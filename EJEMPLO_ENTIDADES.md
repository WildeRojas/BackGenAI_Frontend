# Generador de Entidades Spring Boot

Este generador toma las clases y relaciones del diagrama UML y las convierte en entidades JPA de Spring Boot.

## Ejemplo de entrada (JSON del diagrama):

```json
{
  "classes": [
    {
      "id": "1",
      "nombre": "Usuario",
      "atributos": [
        { "nombre": "nombre", "tipo": "string" },
        { "nombre": "edad", "tipo": "Int" },
        { "nombre": "email", "tipo": "string" }
      ],
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "2", 
      "nombre": "Pedido",
      "atributos": [
        { "nombre": "fecha", "tipo": "date" },
        { "nombre": "total", "tipo": "float" }
      ],
      "position": { "x": 300, "y": 100 }
    }
  ],
  "relations": [
    {
      "id": "rel1",
      "source": "1",
      "target": "2",
      "type": "association",
      "sourceCardinality": "1",
      "targetCardinality": "*"
    }
  ]
}
```

## Código generado (Usuario.java):

```java
package com.example.entities;

import jakarta.persistence.*;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "usuario")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer edad;
    private String email;

    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<Pedido> pedidos;

    // Constructores
    public Usuario() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<Pedido> getPedidos() {
        return pedidos;
    }

    public void setPedidos(List<Pedido> pedidos) {
        this.pedidos = pedidos;
    }
}
```

## Código generado (Pedido.java):

```java
package com.example.entities;

import jakarta.persistence.*;
import java.util.*;
import java.time.LocalDate;

@Entity
@Table(name = "pedido")
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private Double total;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Constructores
    public Pedido() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
```

## Tipos de relaciones soportadas:

### 1. **Association (Asociación)**
- `sourceCardinality: "1"` y `targetCardinality: "*"` → `@OneToMany` y `@ManyToOne`
- `sourceCardinality: "*"` y `targetCardinality: "*"` → `@ManyToMany`
- `sourceCardinality: "1"` y `targetCardinality: "1"` → `@OneToOne`

### 2. **Inheritance (Herencia)**
- No genera campos de relación
- Se puede implementar con `@Entity` + `@Inheritance` (futuro)

### 3. **Aggregation (Agregación)**
- Relación menos fuerte: `@OneToMany` con `cascade = CascadeType.ALL`

### 4. **Composition (Composición)**
- Relación fuerte: `@OneToMany` con `cascade = CascadeType.ALL, orphanRemoval = true`

## Mapeo de tipos:

| Tipo Frontend | Tipo Java |
|---------------|-----------|
| `string`      | `String`  |
| `Int`         | `Integer` |
| `float`       | `Double`  |
| `boolean`     | `Boolean` |
| `date`        | `LocalDate` |

## Estructura de archivos generada:

```
mi-proyecto/
├── pom.xml
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── example/
│       │           ├── MiProyectoApplication.java
│       │           └── entities/
│       │               ├── Usuario.java
│       │               ├── Pedido.java
│       │               └── ...
│       └── resources/
│           └── application.properties
```