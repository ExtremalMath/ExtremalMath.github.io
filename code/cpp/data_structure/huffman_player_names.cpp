#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#define MAX_ID_LEN 20
#define MAX_NAME_LEN 20

typedef struct {
    int frequency;
    char name[MAX_NAME_LEN];
    char id[MAX_ID_LEN];
} admin;

typedef struct {
    int weight;
    int parent, left, right;
} HTNode, *HuffmanTree;

typedef char **HuffmanCode;

void Select(HuffmanTree HT, int end, int *s1, int *s2) {
    int i = 1;
    while (i <= end && HT[i].parent != 0) i++;
    int min1 = HT[i].weight;
    *s1 = i++;
    while (i <= end && HT[i].parent != 0) i++;
    int min2 = HT[i].weight;
    *s2 = i;
    if (min1 > min2) {
        int temp = min1; min1 = min2; min2 = temp;
        temp = *s1; *s1 = *s2; *s2 = temp;
    }
    for (int j = i + 1; j <= end; j++) {
        if (HT[j].parent != 0) continue;
        if (HT[j].weight < min1) {
            min2 = min1; *s2 = *s1;
            min1 = HT[j].weight; *s1 = j;
        } else if (HT[j].weight < min2) {
            min2 = HT[j].weight; *s2 = j;
        }
    }
}

void CreateHuffmanTree(HuffmanTree *HT, admin *admins, int n) {
    int m = 2 * n - 1;
    *HT = (HuffmanTree)malloc((m + 1) * sizeof(HTNode));
    
    for (int i = 1; i <= n; i++) {
        (*HT)[i].weight = admins[i - 1].frequency;
        (*HT)[i].parent = (*HT)[i].left = (*HT)[i].right = 0;
    }
    
    for (int i = n + 1; i <= m; i++) {
        (*HT)[i].weight = (*HT)[i].parent = (*HT)[i].left = (*HT)[i].right = 0;
    }
    
    for (int i = n + 1; i <= m; i++) {
        int s1, s2;
        Select(*HT, i - 1, &s1, &s2);
        (*HT)[s1].parent = (*HT)[s2].parent = i;
        (*HT)[i].left = s1;
        (*HT)[i].right = s2;
        (*HT)[i].weight = (*HT)[s1].weight + (*HT)[s2].weight;
    }
}

void HuffmanCoding(HuffmanTree HT, HuffmanCode *HC, int n) {
    *HC = (HuffmanCode)malloc((n + 1) * sizeof(char *));
    char *cd = (char *)malloc(n * sizeof(char));
    cd[n - 1] = '\0';
    
    for (int i = 1; i <= n; i++) {
        int start = n - 1;
        for (int c = i, f = HT[i].parent; f != 0; c = f, f = HT[f].parent) {
            cd[--start] = HT[f].left == c ? '0' : '1';
        }
        (*HC)[i] = (char *)malloc((n - start) * sizeof(char));
        for (int j = start; j < n; j++) {
            (*HC)[i][j - start] = cd[j];
        }
        (*HC)[i][n - start - 1] = '\0';
    }
    
    free(cd);
}

int HuffmanTreeCode(admin admins[], int n) {
    HuffmanTree HT = NULL;
    HuffmanCode HC = NULL;
    
    CreateHuffmanTree(&HT, admins, n);
    HuffmanCoding(HT, &HC, n);
    
    for (int i = 1; i <= n; i++) {
        strcpy(admins[i-1].id, HC[i]);
    }
    
    for (int i = 1; i <= n; i++) {
        free(HC[i]);
    }
    free(HC);
    free(HT);
    
    return 0;
}

void SortAdminsByFrequency(admin admins[], int n) {
	int i,j,k;
    for (i = 0; i < n-1; i++) {
        for (j = 0; j < n-i-1; j++) {
            if (admins[j].frequency < admins[j+1].frequency) {
                admin temp = admins[j];
                admins[j] = admins[j+1];
                admins[j+1] = temp;
            }
        }
    }
}

void Swap(admin *p1,admin *p2){
	admin temp;
	strcpy(temp.name, p1->name);
    temp.frequency = p1->frequency;
    strcpy(temp.id,p1->id);
    strcpy(p1->name, p2->name);
    p1->frequency = p2->frequency;
    strcpy(p1->id,p2->id);
    strcpy(p2->name, temp.name);
    p2->frequency = temp.frequency;
	strcpy(p2->id,temp.id);
}

void SelectionSort(admin arr[], int size) {
    int i, j, k;
    //admin temp;
    for (i = 0; i < size - 1; i++) {
        //if(arr[i].frequency == -1 && i < size - 2) continue;
        k = i;
        for (j = i + 1; j < size; j++) {
            //if(arr[j].score == -1 && j < size - 1) continue;
            if (arr[j].frequency > arr[k].frequency) {
                k = j;
            }
        }
        if (k != i) {
            Swap(&arr[k], &arr[i]);
        }
    }
}


int FindAdminByCode(admin admins[], int n, const char *targetCode) {
    for (int i = 0; i < n; i++) {
        if (strcmp(admins[i].id, targetCode) == 0) {
            printf("找到个人信息：\n");
            printf("序号: %d\n", i+1);
            printf("姓名: %s\n", admins[i].name);
            printf("频率: %d\n", admins[i].frequency);
            printf("编码: %s\n", admins[i].id);
            return i; 
        }
    }
    printf("未找到匹配的编码：%s\n", targetCode);
    return -1; 
}

int SearchCodeByName(admin admins[], int n, char *name) {
    for (int i = 0; i < n; i++) {
        if (strcmp(admins[i].name, name) == 0) {
            printf("姓名：%s，频率：%d，编码：%s\n", admins[i].name, admins[i].frequency, admins[i].id);
            return i;
        }
    }
    printf("未找到姓名：%s\n", name);
    return -1;
}

void PrintCodeLengths(admin admins[], int n) {
    printf("编码长度统计：\n");
    for (int i = 0; i < n; i++) {
        printf("%s：编码长度 %d\n", admins[i].name, strlen(admins[i].id));
    }
}

void DisplayAllAdmins(admin admins[], int n) {
    printf("所有个人信息：\n");
    printf("序号\t姓名\t频率\t编码\n");
    for (int i = 0; i < n; i++) {
        printf("%d\t%s\t%d\t%s\n", i+1, admins[i].name, admins[i].frequency, admins[i].id);
    }
}

int main() {
    admin admins[28] = {{16, "赵", ""},{15, "钱", ""},{14, "孙", ""},{13, "朱", ""},{12, "李", ""},{11, "周", ""},{10, "吴", ""},{9, "王", ""},{25, "陈", ""},{23, "林", ""},{21, "徐", ""},{19, "郭", ""},{17, "何", ""},{16, "高", ""},{25, "桑", ""},{14, "马", ""},{12, "胡", ""},{11, "许", ""},{10, "邓", ""},{9, "萧", ""},{8, "程", ""},{7, "曹", ""},{6, "袁", ""},{5, "邓", ""},{4, "傅", ""},{3, "丁", ""},{2, "吕", ""},{1, "施", ""}};
    int n = 28;
    HuffmanTreeCode(admins, n);
    int choice;
    char searchName[MAX_NAME_LEN];
    do {
        printf("\n=== 哈夫曼编码管理系统 ===\n");
        printf("1. 显示所有编码\n");
        printf("2. 按频率排序显示\n");
        printf("3. 按姓名查找编码\n");
        printf("4. 显示编码长度\n");
        printf("5. 根据编码查找个人信息\n");
        printf("0. 退出\n");
        printf("请选择操作：");
        scanf("%d", &choice);
        switch(choice) {
            case 1:
                DisplayAllAdmins(admins, n);
                break;
            case 2: {
                admin sortedAdmins[8];
                memcpy(sortedAdmins, admins, sizeof(admin) * n);
                SelectionSort(sortedAdmins, n);
                printf("按频率排序结果：\n");
                DisplayAllAdmins(sortedAdmins, n);
                break;}
            case 3:
                printf("请输入要查找的姓名：");
                scanf("%s", searchName);
                SearchCodeByName(admins, n, searchName);
                break;
            case 4:
                PrintCodeLengths(admins, n);
                break;
            case 5: {
    			printf("请输入要查找的哈夫曼编码：");
    			char searchCode[MAX_ID_LEN];
    			scanf("%s", searchCode);
    			FindAdminByCode(admins, n, searchCode);
    			break;}
            case 0:
                printf("感谢使用\n");
                break;
            default:
                printf("无效选择，请重新输入。\n");
        }
    } while(choice != 0);
    return 0;
}

