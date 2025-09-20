package com.expensetracker.controller;

import com.expensetracker.entity.Expense;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> ResponseEntity.ok().body(expense))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/month/{year}/{month}")
    public List<Expense> getExpensesByMonth(@PathVariable int year, @PathVariable int month) {
        return expenseRepository.findByYearAndMonth(year, month);
    }
    
    @GetMapping("/range")
    public List<Expense> getExpensesByDateRange(@RequestParam String startDate, @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return expenseRepository.findByDateBetween(start, end);
    }
    
    @PostMapping
    public Expense createExpense(@Valid @RequestBody Expense expense) {
        return expenseRepository.save(expense);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expenseDetails) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expense.setAmount(expenseDetails.getAmount());
                    expense.setDescription(expenseDetails.getDescription());
                    expense.setDate(expenseDetails.getDate());
                    expense.setCategory(expenseDetails.getCategory());
                    expense.setType(expenseDetails.getType());
                    return ResponseEntity.ok(expenseRepository.save(expense));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expenseRepository.delete(expense);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}