# 条件解析规范

## 概述

本文档定义了游戏CSV文件中条件表达式的标准化格式和解析规则，确保所有触发条件都能被程序准确、安全地解析和执行。

## 基础语法

### 1. 资源引用格式
```
resource[resource_id]
```
- `resource_id`: 资源在resources.csv中的ID
- 示例：`resource[14]` 表示疲劳度资源

### 2. 比较操作符
```
==  等于
!=  不等于
>   大于
<   小于
>=  大于等于
<=  小于等于
```

### 3. 逻辑操作符
```
&   逻辑与（AND）
|   逻辑或（OR）
!   逻辑非（NOT）
```

### 4. 条件表达式示例
```
resource[14]>50                               # 疲劳度大于50
resource[54]==1&resource[22]==1               # 在公司且职级为1
resource[55]>40&resource[22]>=1&resource[22]<=8  # 同事1好感度>40且职级1-8
```

## 时间条件格式

### 1. 时间引用格式
```
time[property]
```

### 2. 时间属性
```
hour                 # 小时 (0-23)
day                  # 日期 (1-31)
day_of_week          # 星期几 (1-7, 1=周一, 7=周日)
workday              # 是否工作日 (true/false)
weekend              # 是否周末 (true/false)
last_day_of_month    # 是否月末 (true/false)
activated            # 任务是否已激活 (true/false)
15_days_passed       # 是否过了15天 (true/false)
7_days_passed        # 是否过了7天 (true/false)
```

### 3. 时间条件示例
```
time[day_of_week]==7&time[hour]==24          # 周日24点
time[hour]==9&time[workday]==true            # 工作日9点
time[weekend]==true&time[hour]==7            # 周末7点
```

## 计算表达式格式

### 1. 计算函数
```
calc[expression]     # 计算数学表达式
floor[expression]    # 向下取整
ceil[expression]     # 向上取整
abs[expression]      # 绝对值
min[a,b]            # 取最小值
max[a,b]            # 取最大值
```

### 2. 条件函数
```
conditional[condition?true_value:false_value]  # 三元条件运算
```

### 3. 设置函数
```
set[resource_id]=value    # 设置资源值
reset[resource_id]        # 重置资源为0
```

### 4. 计算表达式示例
```
calc[floor((6000+1000*resource[22])*(100-resource[21]/2)/100)]  # 薪水计算
conditional[resource[2]>=2800?0:-2800]                        # 房租支付
calc[resource[56]/10]                                          # 同事技能/10
set[62]=0                                                      # 当日项目进度清零
```

## 特殊条件格式

### 1. 复合状态检查
```
all_attributes>60                    # 所有属性大于60
no_attribute<30                      # 没有属性小于30
skill_not_improved_for_15_days==true # 15天内技能未提升
no_friend_contact_for_7_days==true   # 7天内未联系朋友
rent_payment_failed==true           # 房租支付失败
```

### 2. 常量条件
```
always          # 总是触发
never           # 从不触发
none            # 无文本返回
```

## 安全性规则

### 1. 数学运算安全
- 除法运算前检查除数是否为0
- 使用floor/ceil函数确保结果为整数
- 限制计算结果在合理范围内

### 2. 资源访问安全
- 验证resource_id是否存在于resources.csv中
- 检查资源值是否在min_value和max_value范围内
- 防止资源引用循环依赖

### 3. 表达式复杂度限制
- 限制条件表达式的最大长度
- 限制嵌套计算的深度
- 防止过于复杂的条件表达式

## 解析器实现指南

### 1. 词法分析
- 识别标记：resource, time, calc, conditional等
- 解析数字、字符串和操作符
- 处理括号和优先级

### 2. 语法分析
- 构建表达式树
- 验证语法正确性
- 检查括号匹配

### 3. 语义分析
- 验证资源ID有效性
- 检查类型兼容性
- 识别潜在的运行时错误

### 4. 运行时求值
- 安全地获取资源值
- 执行数学计算
- 返回布尔结果或数值结果

## 测试用例

### 1. 基础条件测试
```
resource[14]>50          # 简单比较
resource[54]==1          # 等值判断
resource[20]>=5          # 大于等于
```

### 2. 复合条件测试
```
resource[54]==1&resource[22]==1&resource[20]>=5&resource[61]>=2  # 多条件AND
resource[55]>40|resource[57]>40                                 # 多条件OR
!resource[69]==0                                                 # NOT条件
```

### 3. 计算表达式测试
```
calc[8000+2000*resource[22]]                    # 基础计算
calc[floor(resource[56]/10)]                    # 带函数计算
conditional[resource[2]>=2800?0:-2800]          # 条件计算
```

### 4. 边界值测试
- 资源值为0、最大值、最小值的情况
- 除数为0的异常处理
- 无效资源ID的错误处理

## 迁移指南

对于现有的自然语言条件，按以下规则转换：

### 1. 属性名映射
```
疲劳度 -> resource[14]
健康度 -> resource[13]
饥饿度 -> resource[15]
职级 -> resource[22]
钱 -> resource[2]
```

### 2. 运算符转换
```
大于 -> >
小于 -> <
等于 -> ==
并且 -> &
或者 -> |
```

### 3. 复杂表达式转换
```
"职级1-8" -> "resource[22]>=1&resource[22]<=8"
"所有同事好感度>70" -> "resource[55]>70&resource[57]>70&resource[59]>70"
"薪水计算" -> "calc[floor((6000+1000*resource[22])*(100-resource[21]/2)/100)]"
```

通过这个标准化规范，所有触发条件都能被程序准确解析和执行，大大提高了系统的可靠性和可维护性。 