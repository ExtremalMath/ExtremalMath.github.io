#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>
#include <time.h>
#include <math.h>

#define MAX_SIZE 100
#define MAX_NAME_LEN 50
#define MAX_PLAYER_NUM 3 //游戏人数 
#define MAX_TIME 180
#define TOTAL_QUESTIONS 2  //总问题数 
#define NUM_OPS 4
#define NUM_STRUCTURES 5
#define EPS 1e-6

typedef struct Node {
    int data;                
    struct Node *leftChild;  
    struct Node *rightChild; 
} BiTreeNode, *BiTree;

typedef struct {
    BiTreeNode* data[MAX_SIZE];
    int top;
} TreeStack;

typedef struct {
    char data[MAX_SIZE];
    int top;
} CharStack;

void GenerateRandomNumbers(int nums[4]) {
    int i;
    for (i = 0; i < 4; i++) {
        nums[i] = rand() % 10 + 1;
    }
}

typedef struct {
    char name[MAX_NAME_LEN];
    int score;
} Player;

void ClearInputBuffer() {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

BiTreeNode* CreateExpTreeNode(BiTreeNode *a, BiTreeNode *b, int value) {
    BiTreeNode* T = (BiTreeNode*)malloc(sizeof(BiTreeNode));
    T->data = value;
    T->leftChild = a;
    T->rightChild = b;
    return T;
}

int GetValue(char theta, int a, int b) {
    switch (theta) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': 
            if (b == 0) {
                return 0;
            }
            return a / b;
        default: return 0;
    }
}

int EvaluateExpressionTree(BiTree T) {
    if (!T->leftChild && !T->rightChild) { 
        return T->data;
    }
    int leftValue = EvaluateExpressionTree(T->leftChild);
    int rightValue = EvaluateExpressionTree(T->rightChild);
    return GetValue((char)T->data, leftValue, rightValue);
}

int GetPriority(char op) {
    switch (op) {
        case '+':
        case '-': return 1;
        case '*':
        case '/': return 2;
        case '(':
        case ')': return 0;
        case '#': return -1;
        default: return 0;
    }
}

void InitTreeStack(TreeStack* stack) {
    stack->top = -1;
}

void InitCharStack(CharStack* stack) {
    stack->top = -1;
}

int IsTreeStackEmpty(TreeStack* stack) {
    return stack->top == -1;
}

int IsCharStackEmpty(CharStack* stack) {
    return stack->top == -1;
}

void PushTree(TreeStack* stack, BiTreeNode* node) {
    if (stack->top < MAX_SIZE - 1) {
        stack->data[++stack->top] = node;
    }
}

void PushChar(CharStack* stack, char ch) {
    if (stack->top < MAX_SIZE - 1) {
        stack->data[++stack->top] = ch;
    }
}

BiTreeNode* PopTree(TreeStack* stack) {
    if (!IsTreeStackEmpty(stack)) {
        return stack->data[stack->top--];
    }
    return NULL;
}

char PopChar(CharStack* stack) {
    if (!IsCharStackEmpty(stack)) {
        return stack->data[stack->top--];
    }
    return '\0';
}

BiTreeNode* TopTree(TreeStack* stack) {
    if (!IsTreeStackEmpty(stack)) {
        return stack->data[stack->top];
    }
    return NULL;
}

char TopChar(CharStack* stack) {
    if (!IsCharStackEmpty(stack)) {
        return stack->data[stack->top];
    }
    return '\0';
}

void CollectNumbersFromTree(BiTree root, int collected[4], int* count) {
    if (root == NULL) return;
    
    CollectNumbersFromTree(root->leftChild, collected, count);
    CollectNumbersFromTree(root->rightChild, collected, count);
    
    if (!root->leftChild && !root->rightChild) { 
        collected[*count] = root->data;
        (*count)++;
    }
}

int ValidateNumbersUsed(BiTree root, int nums[4]) {
    int collected[4] = {0};
    int count = 0;
    int i, j;

    CollectNumbersFromTree(root, collected, &count);
    
    if (count != 4) {
        return 0; 
    }

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3 - i; j++) {
            if (collected[j] > collected[j+1]) {
                int temp = collected[j];
                collected[j] = collected[j+1];
                collected[j+1] = temp;
            }
        }
    }
    
    int sorted_nums[4];
    for (i = 0; i < 4; i++) {
        sorted_nums[i] = nums[i];
    }
    
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3 - i; j++) {
            if (sorted_nums[j] > sorted_nums[j+1]) {
                int temp = sorted_nums[j];
                sorted_nums[j] = sorted_nums[j+1];
                sorted_nums[j+1] = temp;
            }
        }
    }

    for (i = 0; i < 4; i++) {
        if (collected[i] != sorted_nums[i]) {
            return 0;
        }
    }
    
    return 1;
}

void FreeExpressionTree(BiTree root) {
    if (root == NULL) return;
    FreeExpressionTree(root->leftChild);
    FreeExpressionTree(root->rightChild);
    free(root);
}

BiTree CreateExpTree(const char* exp, int* error, int nums[4]) {
    TreeStack EXPT;
    CharStack OPTR;
    InitTreeStack(&EXPT);
    InitCharStack(&OPTR);
    PushChar(&OPTR, '#');
    
    int i = 0;
    int exp_len = strlen(exp);
    
    while (i < exp_len) {
        char ch = exp[i];
        if (isdigit(ch)) { 
            int value = 0;
            while (i < exp_len && isdigit(exp[i])) {
                value = value * 10 + (exp[i] - '0');
                i++;
            }
            i--; 
            
            BiTreeNode* node = CreateExpTreeNode(NULL, NULL, value);
            PushTree(&EXPT, node);
        } 
        else if (ch == '(') {
            PushChar(&OPTR, ch);
        } 
        else if (ch == ')') {
            while (TopChar(&OPTR) != '(') {  
                char op = PopChar(&OPTR);
                BiTreeNode* b = PopTree(&EXPT);
                BiTreeNode* a = PopTree(&EXPT);
                if (a == NULL || b == NULL) {
                    *error = 1;
                    return NULL;
                }
                PushTree(&EXPT, CreateExpTreeNode(a, b, op));
            }
            PopChar(&OPTR); 
        } 
        else if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
            while (!IsCharStackEmpty(&OPTR) && 
                   GetPriority(TopChar(&OPTR)) >= GetPriority(ch)) {
                char op = PopChar(&OPTR);
                BiTreeNode* b = PopTree(&EXPT);
                BiTreeNode* a = PopTree(&EXPT);
                if (a == NULL || b == NULL) {
                    *error = 1;
                    return NULL;
                }
                PushTree(&EXPT, CreateExpTreeNode(a, b, op));
            }
            PushChar(&OPTR, ch);
        } 
        else if (ch == ' ') {
        }
        else {
            *error = 1; 
            return NULL;
        }
        i++;
    }
    while (TopChar(&OPTR) != '#') {
        char op = PopChar(&OPTR);
        BiTreeNode* b = PopTree(&EXPT);
        BiTreeNode* a = PopTree(&EXPT);
        if (a == NULL || b == NULL) {
            *error = 1;
            return NULL;
        }
        PushTree(&EXPT, CreateExpTreeNode(a, b, op));
    }
    BiTree root = PopTree(&EXPT);
    if (!IsTreeStackEmpty(&EXPT)) {
        *error = 1;
        if (root != NULL) {
            FreeExpressionTree(root);
        }
        return NULL;
    }
    
    *error = 0;
    return root;
}

double applyOp(double a, double b, char op) {
    switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            if (fabs(b) < EPS) {
                return 1e9;
            }
            return a / b;
        default:
            return 0.0;
    }
}

double calculate(int nums[4], char ops[3], int structure) {
    double a = (double)nums[0];
    double b = (double)nums[1];
    double c = (double)nums[2];
    double d = (double)nums[3];
    double ab, bc, cd, abc, bcd, ab_cd;

    switch (structure) {
        case 0: 
            ab = applyOp(a, b, ops[0]);
            abc = applyOp(ab, c, ops[1]);
            return applyOp(abc, d, ops[2]);
        case 1:
            bc = applyOp(b, c, ops[1]);
            abc = applyOp(a, bc, ops[0]);
            return applyOp(abc, d, ops[2]);
        case 2:
            bc = applyOp(b, c, ops[1]);
            bcd = applyOp(bc, d, ops[2]);
            return applyOp(a, bcd, ops[0]);
        case 3:
            cd = applyOp(c, d, ops[2]);
            bcd = applyOp(b, cd, ops[1]);
            return applyOp(a, bcd, ops[0]);
        case 4: 
            ab = applyOp(a, b, ops[0]);
            cd = applyOp(c, d, ops[2]);
            return applyOp(ab, cd, ops[1]);
        default:
            return 0.0;
    }
}

void exprString(int nums[4], char ops[3], int structure, char *buf) {
    switch (structure) {
        case 0:
            sprintf(buf, "((%d%c%d)%c%d)%c%d", nums[0], ops[0], nums[1], ops[1], nums[2], ops[2], nums[3]);
            break;
        case 1:
            sprintf(buf, "(%d%c(%d%c%d))%c%d", nums[0], ops[0], nums[1], ops[1], nums[2], ops[2], nums[3]);
            break;
        case 2:
            sprintf(buf, "%d%c((%d%c%d)%c%d)", nums[0], ops[0], nums[1], ops[1], nums[2], ops[2], nums[3]);
            break;
        case 3:
            sprintf(buf, "%d%c(%d%c(%d%c%d))", nums[0], ops[0], nums[1], ops[1], nums[2], ops[2], nums[3]);
            break;
        case 4:
            sprintf(buf, "(%d%c%d)%c(%d%c%d)", nums[0], ops[0], nums[1], ops[1], nums[2], ops[2], nums[3]);
            break;
    }
}

void swap_int(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void permute(int arr[4], int start, char ops[NUM_OPS]) {
    int i, j, k, s;
    if (start == 4) {
        char op3[3];
        for (i = 0; i < NUM_OPS; i++) {
            for (j = 0; j < NUM_OPS; j++) {
                for (k = 0; k < NUM_OPS; k++) {
                    op3[0] = ops[i];
                    op3[1] = ops[j];
                    op3[2] = ops[k];
                    for (s = 0; s < NUM_STRUCTURES; s++) {
                        double result = calculate(arr, op3, s);
                        if (fabs(result - 24.0) < EPS) {
                            char buf[100];
                            exprString(arr, op3, s, buf);
                            printf("%s\n", buf);
                        }
                    }
                }
            }
        }
    } else {
        for (i = start; i < 4; i++) {
            swap_int(&arr[start], &arr[i]);
            permute(arr, start + 1, ops);
            swap_int(&arr[start], &arr[i]);
        }
    }
}

void solve(int nums[4]) {
    char ops[NUM_OPS] = {'+', '-', '*', '/'};
    int arr[4];
    int i;
    for (i = 0; i < 4; i++) {
        arr[i] = nums[i];
    }
    permute(arr, 0, ops);
}

int Play24Game() {
    int total_score = 0;
    int question_num = 0;
    int i;
    
    srand(time(NULL));
    
    while (question_num < TOTAL_QUESTIONS) {
        question_num++;
        printf("\n=== 第%d题 ======进度%d/%d====\n", question_num,question_num,TOTAL_QUESTIONS);
        int nums[4];
        GenerateRandomNumbers(nums);
        printf("数字：%d %d %d %d\n", nums[0], nums[1], nums[2], nums[3]);
        time_t start_time = time(NULL);
        int attempts = 0;
        int answered = 0;
        while (!answered) {
            double elapsed = difftime(time(NULL), start_time);
            if (elapsed >= MAX_TIME) {
                printf("? 时间到！本题未完成\n");
                printf("超时%d秒，本题得分：0\n", (int)elapsed);
                answered = 1;
                break;
            }
            
            printf("\n剩余时间：%d秒 | 尝试次数：%d\n", 
                   MAX_TIME - (int)elapsed, attempts);
            printf("请输入表达式（直接输入表达式即可）：");
            char exp[MAX_SIZE];
            if (scanf("%99s", exp) != 1) {
                printf("输入错误，请重试！\n");
                ClearInputBuffer();
                continue;
            }

            else if (strcmp(exp, "=") == 0) {
                printf("放弃当前题目，进入下一题\n");
                answered = 1;
                break;
            }
            else if(strcmp(exp, "?") == 0) {
                solve(nums);
                break;
            }
            attempts++;
            int error = 0;
            BiTree root = CreateExpTree(exp, &error, nums);
            
            if (error) {
                printf("表达式错误，请检查格式！\n");
                if (root != NULL) {
                    FreeExpressionTree(root);
                }
                continue;
            }
            int valid_nums = ValidateNumbersUsed(root, nums);
            if (!valid_nums) {
                printf(" 必须使用全部给定的4个数字，每个数字只能使用一次！\n");
                FreeExpressionTree(root);
                continue;
            }
            int result = EvaluateExpressionTree(root);
            if (fabs(result - 24) < EPS) {
                elapsed = difftime(time(NULL), start_time);
                int score = (int)(100 * (MAX_TIME - elapsed) / MAX_TIME);
                score = score < 0 ? 0 : score;
                
                printf(" 正确！结果 = 24\n");
                printf("用时：%.1f秒 | 尝试次数：%d\n", elapsed, attempts);
                score += 180 - (int)elapsed;
                printf("本题得分：%d分\n", score);
                
                total_score += score;
                FreeExpressionTree(root);
                answered = 1;
            } else {
                printf(" 结果错误！计算结果 = %d（不是24）\n", result);
                FreeExpressionTree(root);
            }
        }
        
        printf("当前总分：%d\n", total_score);
    }
    
    printf("\n====== 游戏结束 ======\n");
    printf("完成题目：%d道\n", TOTAL_QUESTIONS);
    printf("最终得分：%d分\n", total_score);
    printf("平均每题得分：%.1f分\n", (float)total_score / TOTAL_QUESTIONS);
    return total_score;
}

int OneTry() {
    int m;
    printf("====== 24点游戏 ======\n");
    printf("==游戏版本：一共%d道==\n",TOTAL_QUESTIONS);
    printf("规则：\n");
    printf("1. 系统会随机给出4个1-10的数字\n");
    printf("2. 你需要用+、-、*、/和括号组成表达式，使结果等于24\n");
    printf("3. 每道题限时%d秒，超过时间自动进入下一题\n", MAX_TIME);
    printf("4. 共有%d道题，每道题根据用时计分\n", TOTAL_QUESTIONS);
    printf("5. 输入'='结束当前题目\n\n");
    printf("特别提醒：/为整除，若放弃这一题，则直接输入'=';这里的括号为英文的括号！;\n输入'?'获取本题解的所有答案"); 
    m = Play24Game();
    return m;
}

void Swap(Player *p1, Player *p2) {
    Player temp;
    strcpy(temp.name, p1->name);
    temp.score = p1->score;
    strcpy(p1->name, p2->name);
    p1->score = p2->score;
    strcpy(p2->name, temp.name);
    p2->score = temp.score;
}

void SelectionSort(Player arr[], int size) {
    int i, j, k;
    Player temp;
    for (i = 0; i < size - 1; i++) {
        if(arr[i].score == -1 && i < size - 2) continue;
        k = i;
        for (j = i + 1; j < size; j++) {
            if(arr[j].score == -1 && j < size - 1) continue;
            if (arr[j].score > arr[k].score) {
                k = j;
            }
        }
        if (k != i) {
            Swap(&arr[k], &arr[i]);
        }
    }
}

void printRank(Player arr[], int n) {
    int i;
    printf("=====游戏结算排名=====\n");
    for(i = 0; i < n; i++) {
        if(arr[i].score == -1) continue;
        printf("第%d名：%s\t得分:%d\n", i+1, arr[i].name, arr[i].score);
    }
}

int main() {
    int playernum;
    int i;
    Player team[MAX_PLAYER_NUM];
    for(i = 0; i < MAX_PLAYER_NUM; i++) {
        team[i].score = -1;
    }
    
    printf("请输入本局玩家数量: ");
    scanf("%d", &playernum);
    if(playernum>MAX_PLAYER_NUM)
	{printf("最大人数不能超过%d人！",MAX_PLAYER_NUM);
    printf("请重新输入本局玩家数量: ");
    scanf("%d", &playernum);}  
    ClearInputBuffer();
    
    for(i = 0; i < playernum; i++) {
        printf("请输入当前玩家昵称: ");
        fgets(team[i].name, MAX_NAME_LEN, stdin);
        team[i].name[strcspn(team[i].name, "\n")] = '\0';
        team[i].score = OneTry();
        printf("本局玩家结束，按任意键进行下一轮");
        getchar();getchar();
    }
    SelectionSort(team, playernum);
    printRank(team, playernum);
    printf("\n游戏结束！感谢参与！\n");
    return 0;
}

