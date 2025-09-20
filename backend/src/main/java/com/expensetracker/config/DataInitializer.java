package com.expensetracker.config;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.Expense.ExpenseType;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            initializeCategories();
        }
        
        if (expenseRepository.count() == 0) {
            initializeSampleExpenses();
        }
    }

    private void initializeCategories() {
        Category[] categories = {
            new Category("食費", "#FF6B6B"),
            new Category("交通費", "#4ECDC4"),
            new Category("娯楽", "#45B7D1"),
            new Category("生活用品", "#96CEB4"),
            new Category("医療", "#FFEAA7"),
            new Category("給与", "#74B9FF"),
            new Category("光熱費", "#FD79A8"),
            new Category("家賃", "#6C5CE7"),
            new Category("通信費", "#A29BFE"),
            new Category("教育", "#00B894")
        };

        for (Category category : categories) {
            categoryRepository.save(category);
        }
    }

    private void initializeSampleExpenses() {
        Category foodCategory = categoryRepository.findByName("食費").orElse(null);
        Category transportCategory = categoryRepository.findByName("交通費").orElse(null);
        Category entertainmentCategory = categoryRepository.findByName("娯楽").orElse(null);
        Category livingCategory = categoryRepository.findByName("生活用品").orElse(null);
        Category salaryCategory = categoryRepository.findByName("給与").orElse(null);
        Category utilityCategory = categoryRepository.findByName("光熱費").orElse(null);
        Category rentCategory = categoryRepository.findByName("家賃").orElse(null);

        LocalDate now = LocalDate.now();

        Expense[] expenses = {
            // 今月の収入
            new Expense(new BigDecimal("350000"), "月給", now.withDayOfMonth(25), salaryCategory, ExpenseType.INCOME),
            
            // 今月の支出
            new Expense(new BigDecimal("85000"), "家賃", now.withDayOfMonth(1), rentCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("12000"), "電気代", now.withDayOfMonth(15), utilityCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("3500"), "スーパーでの買い物", now.minusDays(1), foodCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("1200"), "コンビニ弁当", now.minusDays(2), foodCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("800"), "電車代", now.minusDays(3), transportCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("2800"), "映画鑑賞", now.minusDays(7), entertainmentCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("4500"), "書籍購入", now.minusDays(10), entertainmentCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("2100"), "洗剤・シャンプー", now.minusDays(5), livingCategory, ExpenseType.EXPENSE),
            
            // 先月の収入・支出
            new Expense(new BigDecimal("350000"), "月給", now.minusMonths(1).withDayOfMonth(25), salaryCategory, ExpenseType.INCOME),
            new Expense(new BigDecimal("85000"), "家賃", now.minusMonths(1).withDayOfMonth(1), rentCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("11500"), "電気代", now.minusMonths(1).withDayOfMonth(15), utilityCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("25000"), "食費（月間）", now.minusMonths(1).withDayOfMonth(20), foodCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("8000"), "交通費（月間）", now.minusMonths(1).withDayOfMonth(20), transportCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("15000"), "娯楽費", now.minusMonths(1).withDayOfMonth(18), entertainmentCategory, ExpenseType.EXPENSE),
            
            // 先々月の収入・支出
            new Expense(new BigDecimal("350000"), "月給", now.minusMonths(2).withDayOfMonth(25), salaryCategory, ExpenseType.INCOME),
            new Expense(new BigDecimal("85000"), "家賃", now.minusMonths(2).withDayOfMonth(1), rentCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("13200"), "電気代", now.minusMonths(2).withDayOfMonth(15), utilityCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("28000"), "食費（月間）", now.minusMonths(2).withDayOfMonth(20), foodCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("7500"), "交通費（月間）", now.minusMonths(2).withDayOfMonth(20), transportCategory, ExpenseType.EXPENSE),
            new Expense(new BigDecimal("12000"), "娯楽費", now.minusMonths(2).withDayOfMonth(18), entertainmentCategory, ExpenseType.EXPENSE)
        };

        for (Expense expense : expenses) {
            expenseRepository.save(expense);
        }
    }
}