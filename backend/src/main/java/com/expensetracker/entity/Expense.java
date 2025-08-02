package com.expensetracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Positive
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;
    
    private String description;
    
    @NotNull
    private LocalDate date;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Enumerated(EnumType.STRING)
    private ExpenseType type;
    
    public enum ExpenseType {
        INCOME, EXPENSE
    }
    
    public Expense() {}
    
    public Expense(BigDecimal amount, String description, LocalDate date, Category category, ExpenseType type) {
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.category = category;
        this.type = type;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public ExpenseType getType() { return type; }
    public void setType(ExpenseType type) { this.type = type; }
}