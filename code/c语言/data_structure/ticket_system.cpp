#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h> 
#include<math.h>

#define ERROR 0
#define OK 1
#define value id
#define MAX_NAME_LEN 50
#define SEAT_AVAILABLE  0
#define SEAT_OCCUPIED  1   
#define QElemType Guest
#define HashElemType Guest
#define HashFuntionContest 20
#define HTC 30

typedef struct Guest {
    char name[MAX_NAME_LEN];
    int id;
    int ticket;
    int score;
    int seat_number;
    char attribute;
    char importance;
    int savingmoney;
    struct Guest* next;
} Guest;

typedef struct HashElement {
    HashElemType *elem;
    int status;
    struct HashElement *hnext;
} HElement, *HLink;

typedef struct HashTable {
    HLink head[HashFuntionContest];
    int space;
    int total;
} Hashtable,*ht;

int HashFuntion(int num) {
    return num % (HashFuntionContest - 2);
}

typedef struct QNode{
    QElemType data;
    struct QNode *next;
}QNode,*QueuePtr;

typedef struct Lin{
    QueuePtr front;
    QueuePtr rear;
}LinkQueue;

int InitQueue(LinkQueue *Q){
    Q->front=Q->rear=(QueuePtr)malloc(sizeof(QNode));
    if(!Q->front) return 0;
    Q->front->next=NULL;
    return 1;
}

int EnQueue(LinkQueue *Q,QElemType e){
    QueuePtr p;
    p=(QueuePtr)malloc(sizeof(QNode));
    if(!p) return 0;
    p->data=e;
    p->next=NULL;
    Q->rear->next=p;
    Q->rear=p;
    return 1;
}

int EnRightQueueAttribute(LinkQueue *QA,LinkQueue *QE,LinkQueue *QN,Guest g){
    switch (g.attribute) {
        case 'a':
            EnQueue(QA,g);
            break;
        case 'e':
            EnQueue(QE,g);
            break;
        case 'n':
            EnQueue(QN,g);
            break;
        default:
            printf("未知身份\n");
            return 0;
    }
    return 1;
} 

int EnRightQueueImportance(LinkQueue *QS,LinkQueue *QV,LinkQueue *QY,Guest g){
    switch (g.importance) {
        case 'y':
            EnQueue(QY,g);
            break;
        case 'v':
            EnQueue(QV,g);
            break;
        case 's':
            EnQueue(QS,g);
            break;
        default:
            printf("未知身份\n");
            return 0;
    }
    return 1;
} 

int DeQueue(LinkQueue *Q,QElemType *e){
    QueuePtr p;
    if(Q->front==Q->rear)return 0;
    p=Q->front->next;
    *e=p->data;
    Q->front->next=p->next;
    if(Q->rear==p) Q->rear=Q->front;
    free(p);
    return 1;
}

int GetHead(LinkQueue *Q,QElemType *e){
    if(Q->front==Q->rear)return 0;
    *e=Q->front->next->data;
    return 1;
}

int QueueEmpty(LinkQueue *Q){
    return Q->front==Q->rear;
}

int QueueLength(LinkQueue *Q){
    int length=0;
    QueuePtr p=Q->front->next;
    while(p){
        length++;
        p=p->next;
    }
    return length;
}

int ClearQueue(LinkQueue *Q){
    QueuePtr p,q;
    p=Q->front->next;
    while(p){
        q=p->next;
        free(p);
        p=q;
    }
    Q->front->next=NULL;
    Q->rear=Q->front;
    return 1;
}

int DestroyQueue(LinkQueue *Q){
    while(Q->front){
        Q->rear=Q->front->next;
        free(Q->front);
        Q->front=Q->rear;
    }
    return 1;
}

int myprint(LinkQueue *Q){
    QueuePtr q=Q->front->next;
    if(!q) printf("the queue is empty");
    while(q){
        printf("(id:%d,name:%s,seat:%d) ", q->data.id, q->data.name, q->data.seat_number);
        q=q->next;
    }
    printf("\n");
    return 1;
}

void initHashTable(Hashtable **Ht) {
    *Ht = (Hashtable*)malloc(sizeof(Hashtable));
    int i = 0;
    for(i = 0; i < HashFuntionContest; i++) {
        (*Ht)->head[i] = NULL;
    }
    (*Ht)->total = 0;
    (*Ht)->space = HTC;
}

void InsertHT(Hashtable *Ht, HashElemType g) {
    int m = HashFuntion(g.id);
    HLink h = (HLink)malloc(sizeof(HElement));
    HashElemType *newElem = (HashElemType*)malloc(sizeof(HashElemType));
    
    strcpy(newElem->name, g.name);
    newElem->ticket = g.ticket;
    newElem->id = g.id;
    newElem->seat_number = g.seat_number;
    newElem->attribute = g.attribute;
    newElem->score = g.score;
    newElem->importance = g.importance;
    newElem->savingmoney = g.savingmoney;
    newElem->next = g.next;
    
    h->elem = newElem;
    h->status = 1;
    h->hnext = NULL;
    
    if(Ht->head[m] == NULL) {
        Ht->head[m] = h;
    } else {
        HLink p = Ht->head[m];
        while(p->hnext != NULL) {
            p = p->hnext;
        }
        p->hnext = h;
    }
    Ht->total++;
}

void PrintHashTable(Hashtable *Ht) {
    int i = 0;
    for(i = 0; i < HashFuntionContest; i++) {
        printf("Bucket[%d]: ", i);
        HLink p = Ht->head[i];
        while(p != NULL) {
            if(p->elem != NULL) {
                printf("(id:%d,name:%s) ", p->elem->id, p->elem->name);
            }
            p = p->hnext;
        }
        printf("\n");
    }
    printf("Total elements: %d\n", Ht->total);
}

void FreeHashTable(Hashtable *Ht) {
    int i = 0;
    for(i = 0; i < HashFuntionContest; i++) {
        HLink p = Ht->head[i];
        while(p != NULL) {
            HLink temp = p;
            p = p->hnext;
            if(temp->elem != NULL) {
                free(temp->elem);
            }
            free(temp);
        }
    }
    free(Ht);
}

void generate_attribute(Guest *g) {
    int p = rand() % 100 + 1;
    if (p == 1) {
        g->attribute = 'a';
    } else if (p <= 11) {
        g->attribute = 'e';
    } else {
        g->attribute = 'n';
    }
}

void print_attribute(const Guest *g) {
    switch (g->attribute) {
        case 'a':
            printf("职业身份是：军人\n");
            break;
        case 'e':
            printf("职业身份是：教师\n");
            break;
        case 'n':
            printf("职业身份是：群众\n");
            break;
        default:
            printf("未知职业身份\n");
    }
}

void determine_vip(Guest *g) {
    if (g->savingmoney >= 4000) {
        g->importance = 's';
    } else if (g->savingmoney >= 2000) {
        g->importance = 'v';
    } else {
        g->importance = 'y';
    }
}

void print_vip(const Guest *g) {
    switch (g->importance) {
        case 's':
            printf("身份是：超级会员\n");
            break;
        case 'v':
            printf("身份是：会员\n");
            break;
        case 'y':
            printf("身份是：普通观众\n");
            break;
        default:
            printf("未知会员等级\n");
    }
}

void inputGuest(Guest *g) {
    printf("请输入你的姓名: ");
	getchar();
    scanf("%[^\n]", g->name);
    printf("请输入你的证件号: ");
    scanf("%d", &(g->id));
    printf("请输入你的储蓄金额: ");
    scanf("%d", &(g->savingmoney));
    //getchar();
    generate_attribute(g);
    determine_vip(g);
    g->ticket = 0;
    g->seat_number = 0;
    g->score = 0;
    g->next = NULL;
}

void printGuest(Guest *g) {
    printf("=========身份检查=========\n");
    printf("姓名: %s\n", g->name);
    printf("证件号: %d\n", g->id);
    printf("你的");
    print_vip(g);
    printf("你的");
    print_attribute(g);
    printf("预约状态: %s\n", g->ticket ? "已预约" : "未预约");
    if (g->ticket) {
        printf("座位号: %d\n", g->seat_number);
    }
    printf("==========================\n");
}

int login(LinkQueue *Q) {
    Guest g;
    int confirm;
    
    printf("\n=== 观众登录 ===\n");
    inputGuest(&g);
    printf("\n请检查你的个人信息是否完整:\n");
    printGuest(&g);
    
    printf("\n请确认个人信息是否正确（正确输入1，重新输入输入0）: ");
    scanf("%d", &confirm);
    //getchar();
    
    if (confirm == 1) {
        if (EnQueue(Q, g)) {
            printf("\n观众 %s 已成功加入队列\n", g.name);
            return 1;
        } else {
            printf("\n入队失败\n");
            return 0;
        }
    } else {
        printf("\n已取消登录\n");
        return 0;
    }
}

Guest* setSeatNumber(LinkQueue *Q){
    int score=1;
    int flag=1;
    Guest* p = NULL;
    Guest* L = NULL;
    Guest g;
    
    while(!QueueEmpty(Q)){
        DeQueue(Q, &g);
        
        if(flag){
            L = (Guest*)malloc(sizeof(Guest));
            *L = g;
            L->next = NULL;
            flag = 0;
            p = L;
        } else {
            Guest* newNode = (Guest*)malloc(sizeof(Guest));
            *newNode = g;
            newNode->next = NULL;
            p->next = newNode;
            p = newNode;
        }
        
        p->seat_number = score + p->importance + p->attribute;
        score++;
    }
    return L;
}

void sortBySeatNumber(LinkQueue *Q){
    Guest* Head = (Guest*)malloc(sizeof(Guest));
    Head->next = setSeatNumber(Q);
    
    Guest* current = Head->next;
    while(current != NULL){
        Guest* min = current;
        Guest* preMin = Head;
        Guest* p = current;
        Guest* pre = Head;
        
        while(p != NULL){
            if(p->seat_number < min->seat_number){
                min = p;
                preMin = pre;
            }
            pre = p;
            p = p->next;
        }
        
        if(min != current){
            preMin->next = min->next;
            min->next = current;
            Head->next = min;
        }
        
        current = min->next;
    }
    
    Guest* sorted = Head->next;
    while(sorted != NULL){
        EnQueue(Q, *sorted);
        Guest* temp = sorted;
        sorted = sorted->next;
        free(temp);
    }
    free(Head);
}

void sortedBySeatnumber(LinkQueue *Q,Hashtable *ht){
	Guest* L=setSeatNumber(Q);
	Guest* p=L;
	while(p){
		InsertHT(ht, *p);
		p=p->next;
	}
}

void TestFunData(Hashtable *Ht, LinkQueue *Q){
    Guest elem1 = {"Alice", 1001, 0, 0, 0, 'n', 'y', 1000, NULL};
    Guest elem2 = {"Bob", 1002, 0, 0, 0, 'e', 'v', 3000, NULL};
    Guest elem3 = {"Charlie", 1003, 0, 0, 0, 'n', 's', 5000, NULL};
    Guest elem4 = {"David", 1010, 0, 0, 0, 'a', 'y', 1500, NULL};
    Guest elem5 = {"Eve", 1011, 0, 0, 0, 'n', 'v', 2500, NULL};
    Guest elem6 = {"Frank", 1005, 0, 0, 0, 'e', 'y', 1000, NULL};
    Guest elem7 = {"Alice2", 1001, 0, 0, 0, 'n', 'y', 1000, NULL};
    Guest elem8 = {"David2", 1010, 0, 0, 0, 'a', 'y', 1500, NULL};
    Guest elem9 = {"Michael", 1012, 0, 0, 0, 'e', 's', 2000, NULL};
    Guest elem10 = {"Sophia", 1013, 0, 0, 0, 'a', 'v', 4500, NULL};
    Guest elem11 = {"Liam", 1014, 0, 0, 0, 'n', 'y', 800, NULL};
    Guest elem12 = {"Emma", 1015, 0, 0, 0, 'e', 's', 6000, NULL};
    Guest elem13 = {"Noah", 1016, 0, 0, 0, 'a', 'y', 1800, NULL};
    Guest elem14 = {"Olivia", 1017, 0, 0, 0, 'n', 'v', 2200, NULL};
    Guest elem15 = {"Lucas", 1018, 0, 0, 0, 'e', 'y', 1200, NULL};
    Guest elem16 = {"Ava", 1019, 0, 0, 0, 'a', 's', 4200, NULL};
    Guest elem17 = {"Elijah", 1020, 0, 0, 0, 'n', 'y', 900, NULL};
    Guest elem18 = {"Mia", 1021, 0, 0, 0, 'e', 'v', 3800, NULL};
    Guest elem19 = {"Ethan", 1022, 0, 0, 0, 'a', 'y', 1600, NULL};
    Guest elem20 = {"Charlotte", 1023, 0, 0, 0, 'n', 's', 4800, NULL};
    /*
    printf("Testing hash table insertion:\n");
    InsertHT(Ht, elem1);
    InsertHT(Ht, elem2);
    InsertHT(Ht, elem3);
    InsertHT(Ht, elem4);
    InsertHT(Ht, elem5);
    InsertHT(Ht, elem6);
    InsertHT(Ht, elem7);
    InsertHT(Ht, elem8);
    InsertHT(Ht, elem9);
    InsertHT(Ht, elem10);
    InsertHT(Ht, elem11);
    InsertHT(Ht, elem12);
    InsertHT(Ht, elem13);
    InsertHT(Ht, elem14);
    InsertHT(Ht, elem15);
    InsertHT(Ht, elem16);
    InsertHT(Ht, elem17);
    InsertHT(Ht, elem18);
    InsertHT(Ht, elem19);
    InsertHT(Ht, elem20);
    */
    //printf("Testing queue insertion:\n");
    EnQueue(Q, elem1);
    EnQueue(Q, elem2);
    EnQueue(Q, elem3);
    EnQueue(Q, elem4);
    EnQueue(Q, elem5);
    EnQueue(Q, elem6);
    EnQueue(Q, elem7);
    EnQueue(Q, elem8);
    EnQueue(Q, elem9);
    EnQueue(Q, elem10);
    EnQueue(Q, elem11);
    EnQueue(Q, elem12);
    EnQueue(Q, elem13);
    EnQueue(Q, elem14);
    EnQueue(Q, elem15);
    EnQueue(Q, elem16);
    EnQueue(Q, elem17);
    EnQueue(Q, elem18);
    EnQueue(Q, elem19);
    EnQueue(Q, elem20);
    /*printf("\nHash table contents:\n");
    PrintHashTable(Ht);
    printf("\nQueue contents before sorting:\n");
    myprint(Q);
    printf("\nSorting queue by seat number...\n");
    sortBySeatNumber(Q);
    printf("\nQueue contents after sorting:\n");
    myprint(Q);*/
    printf("插入测试数据完成！\n");
}


int main() {
    srand((unsigned int)time(NULL));
    Hashtable *ht = NULL;
    LinkQueue Q;
    int conti=1;
    int flag =1;
    printf("Initialized hash table and queue.\n");
	InitQueue(&Q);initHashTable(&ht);
    //printf("Running comprehensive test...\n");
    printf("\n");
    while(conti){
	printf("===请输入需要办理的业务：===\n");
	printf("1.登陆并且订票(第二个人在登陆时姓名前需要加上空格)\n");
	printf("2.生成测试数据\n");
	printf("3.开始模拟排队订票+进入\n");
	printf("0.退出系统\n");
	printf("请输入编号：");
	scanf("%d",&flag);
	printf("\n");
	switch(flag){
		case 1:{login(&Q);break;}
		case 2:TestFunData(ht, &Q);break;
		case 3:sortedBySeatnumber(&Q,ht);printf("座位哈希表如图所示：\n");PrintHashTable(ht);break;
		case 0:conti=0;
	}
    //sortBySeatNumber(&Q);
	}
 
    printf("\nCleaning up...\n");
    //FreeHashTable(ht);
    ClearQueue(&Q);
    
    printf("Test completed.\n");
    
    return 0;
}

