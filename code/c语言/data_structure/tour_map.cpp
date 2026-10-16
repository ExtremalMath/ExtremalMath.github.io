#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <math.h>

#define MVNum 100        
#define OK 1
#define ERROR 0
#define INF 1000000.0    

typedef int Status;
typedef char VerTexType[50];

typedef struct ArcNode {
    int adjvex;             
    double weight;          
    struct ArcNode* nextarc; 
} ArcNode;

typedef struct VNode {
    VerTexType data;       
    int id;                
    char type;             
    ArcNode* firstarc;     
} VNode, AdjList[MVNum];

typedef struct {
    AdjList vertices;      
    int vexnum, arcnum;    
} ALGraph;

typedef struct EdgeInfo {
    char v1[50];
    char v2[50];
    double weight;
} EdgeInfo;

typedef struct ScenicIntro {
    char name[50];
    char description[500];
} ScenicIntro;

int LocateVexALG(const ALGraph* G, const char* v) {
	int i;
    for ( i = 0; i < G->vexnum; ++i) {
        if (strcmp(G->vertices[i].data, v) == 0) {
            return i;
        }
    }
    return -1;
}

int IsEdgeExists(const ALGraph* G, int i, int j) {
    ArcNode* p = G->vertices[i].firstarc;
    while (p != NULL) {
        if (p->adjvex == j) {
            return 1;
        }
        p = p->nextarc;
    }
    return 0;
}

void AddEdge(ALGraph* G, int i, int j, double weight, int* edgeCount) {
    if (i == -1 || j == -1) {
        printf("错误: 无效的顶点索引\n");
        return;
    }
    
    if (i == j) {
        printf("警告: 尝试添加自环边，已跳过\n");
        return;
    }
    
    if (IsEdgeExists(G, i, j)) {
        return;
    }
    
    ArcNode* p1 = (ArcNode*)malloc(sizeof(ArcNode));
    p1->adjvex = j;
    p1->weight = weight;
    p1->nextarc = G->vertices[i].firstarc;
    G->vertices[i].firstarc = p1;
    
    ArcNode* p2 = (ArcNode*)malloc(sizeof(ArcNode));
    p2->adjvex = i;
    p2->weight = weight;
    p2->nextarc = G->vertices[j].firstarc;
    G->vertices[j].firstarc = p2;
    
    (*edgeCount)++;
}

Status CreateUDG(ALGraph* G) {
	int i,k;
    printf("\n请输入顶点个数: ");
    scanf("%d", &G->vexnum);
    printf("请输入边的个数: ");
    scanf("%d", &G->arcnum);

    printf("请依次输入每个顶点的 *名称* *编号* *属性(h/e/b)*，以空格分隔：\n");
    for ( i = 0; i < G->vexnum; ++i) {
        scanf("%s %d %c", G->vertices[i].data, &G->vertices[i].id, &G->vertices[i].type);
        G->vertices[i].firstarc = NULL;
    }

    printf("请输入%d条边所连接的两个顶点的名称和权重，以空格分隔：\n", G->arcnum);
    int edgeCount = 0;
    for (k = 0; k < G->arcnum; ++k) {
        char v1[50], v2[50];
        double weight;
        scanf("%s %s %lf", v1, v2, &weight);
        int i = LocateVexALG(G, v1);
        int j = LocateVexALG(G, v2);

        if (i == -1 || j == -1) {
            printf("输入了不存在的顶点，请检查。\n");
            continue;
        }

        AddEdge(G, i, j, weight, &edgeCount);
    }
    
    G->arcnum = edgeCount / 2;
    return OK;
}

void PrintGraph(const ALGraph* G) {
	int i;
    printf("\n========== 图结构信息 (邻接表) ==========\n");
    printf("顶点数量: %d, 边数量: %d\n", G->vexnum, G->arcnum);
    printf("-----------------------------------------\n");
    for ( i = 0; i < G->vexnum; ++i) {
        printf("名称:\"%s\"", G->vertices[i].data);
        printf(" -> 邻接点[名称,权重]: ");

        ArcNode* p = G->vertices[i].firstarc;
        int degree = 0;
        int first = 1;
        while (p != NULL) {
            int adjIndex = p->adjvex;
            if (!first) printf(", ");
            printf("%s,%.1lfkm", G->vertices[adjIndex].data, p->weight);
            p = p->nextarc;
            degree++;
            first = 0;
        }
        if (degree == 0) {
            printf("无邻接点");
        }
        printf("\n");
    }
    printf("=========================================\n\n");
}

void PrintGraphSimple(const ALGraph* G) {
	int i;
    printf("\n========== 简洁图结构信息 (邻接表) ==========\n");
    printf("顶点数量: %d, 边数量: %d\n", G->vexnum, G->arcnum);
    printf("-----------------------------------------\n");
    for (i = 0; i < G->vexnum; ++i) {
        printf("%s -> 邻接点: ", G->vertices[i].data);

        ArcNode* p = G->vertices[i].firstarc;
        int first = 1;
        while (p != NULL) {
            int adjIndex = p->adjvex;
            if (!first) printf(", ");
            printf("%s(%.1lfkm)", G->vertices[adjIndex].data, p->weight);
            p = p->nextarc;
            first = 0;
        }
        printf("\n");
    }
    printf("=========================================\n\n");
}


void PrintByType(const ALGraph* G, char type) {
	int i;
    const char* typeName;  
    switch(type) {
        case 'h': typeName = "人文类景点"; break;
        case 'e': typeName = "自然类景点"; break;
        case 'b': typeName = "双属性景点"; break;
        default: typeName = "未知类型景点"; break;
    }
    
    printf("\n=== %s (共%d个景点) ===\n", typeName, G->vexnum);
    int count = 0;
    for (i = 0; i < G->vexnum; ++i) {
        if (G->vertices[i].type == type) {
            printf("%d. %s (编号:%d, 索引:%d)\n", ++count, G->vertices[i].data, G->vertices[i].id, i);
        }
    }
    if (count == 0) {
        printf("未找到%s\n", typeName);
    } else {
        printf("总计: %d 个%s\n", count, typeName);
    }
}

void DestroyGraph(ALGraph* G) {
	int i,k;
    for ( i = 0; i < G->vexnum; ++i) {
        ArcNode* p = G->vertices[i].firstarc;
        while (p != NULL) {
            ArcNode* temp = p;
            p = p->nextarc;
            free(temp);
        }
        G->vertices[i].firstarc = NULL;
    }
    G->vexnum = 0;
    G->arcnum = 0;
    printf("图内存已释放\n");
}

void DFS(const ALGraph* G, int v, int* visited, int* component, int* compSize) {
    visited[v] = 1;
    component[(*compSize)++] = v;
    
    ArcNode* p = G->vertices[v].firstarc;
    while (p != NULL) {
        int adj = p->adjvex;
        if (!visited[adj]) {
            DFS(G, adj, visited, component, compSize);
        }
        p = p->nextarc;
    }
}

int** GetConnectedComponents(const ALGraph* G, int* componentCount, int* compSizes) {
	int i;
    int* visited = (int*)calloc(G->vexnum, sizeof(int));
    int** components = (int**)malloc(sizeof(int*) * G->vexnum);
    
    *componentCount = 0;
    
    for (i = 0; i < G->vexnum; ++i) {
        if (!visited[i]) {
            compSizes[*componentCount] = 0;
            components[*componentCount] = (int*)malloc(sizeof(int) * G->vexnum);
            DFS(G, i, visited, components[*componentCount], &compSizes[*componentCount]);
            (*componentCount)++;
        }
    }
    
    free(visited);
    return components;
}

void CreateZhenjiangWeightedGraph(ALGraph* G) {
	int i,k;
    printf("\n=== 创建带权重的镇江景点图===\n");
    
    G->vexnum = 26;
    G->arcnum = 0;
    
    VNode vertices[] = {
        {"城上村遗址", 1, 'h', NULL},
        {"镇江醋文化博物馆", 2, 'h', NULL},
        {"永安陵石刻", 3, 'h', NULL},
        {"修安陵石刻", 4, 'h', NULL},
        {"访仙镇", 5, 'h', NULL},
        {"吕城镇", 6, 'h', NULL},
        {"金山寺", 7, 'h', NULL},
        {"北固楼", 8, 'h', NULL},
        {"西津渡古街", 9, 'h', NULL},
        {"焦山定慧寺", 10, 'h', NULL},
        {"甘露寺铁塔", 11, 'h', NULL},
        {"镇江天主教堂", 12, 'h', NULL},
        {"铁瓮城遗址", 13, 'h', NULL},
        {"镇江体育会展中心", 14, 'h', NULL},
        {"镇江站南广场", 15, 'h', NULL},
        {"句容余坤开元大酒店", 16, 'h', NULL},
        {"苏宁广场", 17, 'h', NULL},
        {"江苏大学", 18, 'h', NULL},
        {"镇江火车站", 19, 'h', NULL},
        {"镇江市政府", 20, 'h', NULL},
        {"江苏茶博园", 21, 'e', NULL},
        {"南山森林公园", 22, 'b', NULL},
        {"宝华山森林公园", 23, 'b', NULL},
        {"葛仙观", 24, 'b', NULL},
        {"茅山景区", 25, 'b', NULL},
        {"敕赐九霄万福宫", 26, 'b', NULL}
    };
    
    for ( i = 0; i < G->vexnum; ++i) {
        G->vertices[i] = vertices[i];
    }
    
    const int edgeCount = 37;
    EdgeInfo edgeArray[37];
    
    strcpy(edgeArray[0].v1, "苏宁广场"); strcpy(edgeArray[0].v2, "镇江市政府"); edgeArray[0].weight = 1.2;
    strcpy(edgeArray[1].v1, "镇江市政府"); strcpy(edgeArray[1].v2, "镇江站南广场"); edgeArray[1].weight = 5.8;
    strcpy(edgeArray[2].v1, "镇江站南广场"); strcpy(edgeArray[2].v2, "镇江体育会展中心"); edgeArray[2].weight = 2.3;
    strcpy(edgeArray[3].v1, "镇江体育会展中心"); strcpy(edgeArray[3].v2, "南山森林公园"); edgeArray[3].weight = 3.1;
    strcpy(edgeArray[4].v1, "苏宁广场"); strcpy(edgeArray[4].v2, "镇江站南广场"); edgeArray[4].weight = 4.5;
    strcpy(edgeArray[5].v1, "镇江市政府"); strcpy(edgeArray[5].v2, "江苏大学"); edgeArray[5].weight = 6.7;
    strcpy(edgeArray[6].v1, "镇江站南广场"); strcpy(edgeArray[6].v2, "江苏大学"); edgeArray[6].weight = 8.9;
    
    strcpy(edgeArray[7].v1, "金山寺"); strcpy(edgeArray[7].v2, "西津渡古街"); edgeArray[7].weight = 0.8;
    strcpy(edgeArray[8].v1, "西津渡古街"); strcpy(edgeArray[8].v2, "北固楼"); edgeArray[8].weight = 2.1;
    strcpy(edgeArray[9].v1, "北固楼"); strcpy(edgeArray[9].v2, "焦山定慧寺"); edgeArray[9].weight = 3.6;
    strcpy(edgeArray[10].v1, "西津渡古街"); strcpy(edgeArray[10].v2, "甘露寺铁塔"); edgeArray[10].weight = 0.6;
    strcpy(edgeArray[11].v1, "西津渡古街"); strcpy(edgeArray[11].v2, "镇江天主教堂"); edgeArray[11].weight = 0.5;
    strcpy(edgeArray[12].v1, "北固楼"); strcpy(edgeArray[12].v2, "铁瓮城遗址"); edgeArray[12].weight = 1.9;
    strcpy(edgeArray[13].v1, "金山寺"); strcpy(edgeArray[13].v2, "铁瓮城遗址"); edgeArray[13].weight = 3.2;
    
    strcpy(edgeArray[14].v1, "南山森林公园"); strcpy(edgeArray[14].v2, "镇江醋文化博物馆"); edgeArray[14].weight = 7.4;
    strcpy(edgeArray[15].v1, "南山森林公园"); strcpy(edgeArray[15].v2, "西津渡古街"); edgeArray[15].weight = 5.3;
    strcpy(edgeArray[16].v1, "镇江醋文化博物馆"); strcpy(edgeArray[16].v2, "镇江站南广场"); edgeArray[16].weight = 4.9;
    
    strcpy(edgeArray[17].v1, "江苏大学"); strcpy(edgeArray[17].v2, "北固楼"); edgeArray[17].weight = 3.8;
    strcpy(edgeArray[18].v1, "江苏大学"); strcpy(edgeArray[18].v2, "焦山定慧寺"); edgeArray[18].weight = 4.2;
    strcpy(edgeArray[19].v1, "镇江站南广场"); strcpy(edgeArray[19].v2, "金山寺"); edgeArray[19].weight = 3.4;
    
    strcpy(edgeArray[20].v1, "茅山景区"); strcpy(edgeArray[20].v2, "敕赐九霄万福宫"); edgeArray[20].weight = 2.5;
    strcpy(edgeArray[21].v1, "敕赐九霄万福宫"); strcpy(edgeArray[21].v2, "葛仙观"); edgeArray[21].weight = 3.7;
    strcpy(edgeArray[22].v1, "茅山景区"); strcpy(edgeArray[22].v2, "葛仙观"); edgeArray[22].weight = 4.1;
    
    strcpy(edgeArray[23].v1, "江苏茶博园"); strcpy(edgeArray[23].v2, "茅山景区"); edgeArray[23].weight = 8.2;
    strcpy(edgeArray[24].v1, "句容余坤开元大酒店"); strcpy(edgeArray[24].v2, "江苏茶博园"); edgeArray[24].weight = 9.7;
    strcpy(edgeArray[25].v1, "句容余坤开元大酒店"); strcpy(edgeArray[25].v2, "茅山景区"); edgeArray[25].weight = 17.9;
    
    strcpy(edgeArray[26].v1, "城上村遗址"); strcpy(edgeArray[26].v2, "永安陵石刻"); edgeArray[26].weight = 4.8;
    strcpy(edgeArray[27].v1, "永安陵石刻"); strcpy(edgeArray[27].v2, "修安陵石刻"); edgeArray[27].weight = 1.1;
    strcpy(edgeArray[28].v1, "修安陵石刻"); strcpy(edgeArray[28].v2, "访仙镇"); edgeArray[28].weight = 6.3;
    
    strcpy(edgeArray[29].v1, "访仙镇"); strcpy(edgeArray[29].v2, "吕城镇"); edgeArray[29].weight = 6.0;
    strcpy(edgeArray[30].v1, "城上村遗址"); strcpy(edgeArray[30].v2, "访仙镇"); edgeArray[30].weight = 10.9;
    
    strcpy(edgeArray[31].v1, "南山森林公园"); strcpy(edgeArray[31].v2, "宝华山森林公园"); edgeArray[31].weight = 15.0;
    strcpy(edgeArray[32].v1, "宝华山森林公园"); strcpy(edgeArray[32].v2, "茅山景区"); edgeArray[32].weight = 12.0;
    strcpy(edgeArray[33].v1, "江苏茶博园"); strcpy(edgeArray[33].v2, "宝华山森林公园"); edgeArray[33].weight = 8.5;
    strcpy(edgeArray[34].v1, "西津渡古街"); strcpy(edgeArray[34].v2, "镇江醋文化博物馆"); edgeArray[34].weight = 5.5;
    strcpy(edgeArray[35].v1, "江苏大学"); strcpy(edgeArray[35].v2, "镇江火车站"); edgeArray[35].weight = 3.0;
    strcpy(edgeArray[36].v1, "镇江火车站"); strcpy(edgeArray[36].v2, "镇江站南广场"); edgeArray[36].weight = 1.5;
    
    int addedEdgeCount = 0;
    for ( k = 0; k < edgeCount; ++k) {
        int i = LocateVexALG(G, edgeArray[k].v1);
        int j = LocateVexALG(G, edgeArray[k].v2);
        double weight = edgeArray[k].weight;
        
        if (i != -1 && j != -1) {
            AddEdge(G, i, j, weight, &addedEdgeCount);
        } else {
            printf("警告: 边连接 %s - %s 中包含无效顶点，已跳过此边\n", edgeArray[k].v1, edgeArray[k].v2);
        }
    }
    
    G->arcnum = addedEdgeCount / 2;
    
    printf("带权重的镇江景点图创建完成！\n");
    printf("包含 %d 个顶点和 %d 条边\n", G->vexnum, G->arcnum);
}

void CreateConnectedZhenjiangGraph(ALGraph* G) {
	int i;
    CreateZhenjiangWeightedGraph(G);
    
    int componentCount = 0;
    int* compSizes = (int*)malloc(sizeof(int) * G->vexnum);
    int** components = GetConnectedComponents(G, &componentCount, compSizes);
    
    if (componentCount > 1) {
        printf("\n检测到 %d 个连通分量，正在添加连接边...\n", componentCount);
        
        int edgeCount = G->arcnum * 2;
        
        int zhenjiangIdx = LocateVexALG(G, "苏宁广场");
        int jurongIdx = LocateVexALG(G, "茅山景区");
        int danyangIdx = LocateVexALG(G, "城上村遗址");
        
        if (zhenjiangIdx != -1 && jurongIdx != -1 && danyangIdx != -1) {
            printf("添加连接边: 苏宁广场 <-> 茅山景区 (权重: 20.0km)\n");
            AddEdge(G, zhenjiangIdx, jurongIdx, 20.0, &edgeCount);
            
            printf("添加连接边: 茅山景区 <-> 城上村遗址 (权重: 20.0km)\n");
            AddEdge(G, jurongIdx, danyangIdx, 20.0, &edgeCount);
            
            G->arcnum = edgeCount / 2;
            
            printf("\n连通图创建完成！\n");
            printf("添加了2条连接边，使整个图连通。\n");
        } else {
            printf("错误: 找不到区域代表景点\n");
        }
    } else {
        printf("图已经是连通图，无需添加连接边。\n");
    }
    
    for (i = 0; i < componentCount; ++i) {
        free(components[i]);
    }
    free(components);
    free(compSizes);
    
    componentCount = 0;
    compSizes = (int*)malloc(sizeof(int) * G->vexnum);
    components = GetConnectedComponents(G, &componentCount, compSizes);
    
    printf("最终连通分量数量: %d\n", componentCount);
    if (componentCount == 1) {
        printf("√ 图是连通图\n");
    } else {
        printf("× 图不是连通图\n");
    }
    
    for (i = 0; i < componentCount; ++i) {
        free(components[i]);
    }
    free(components);
    free(compSizes);
}

void Dijkstra(const ALGraph* G, int start, double* dist, int* prev) {
	int i,j;
    int n = G->vexnum;
    int* visited = (int*)calloc(n, sizeof(int));
    
    for (i = 0; i < n; ++i) {
        dist[i] = INF;
        prev[i] = -1;
    }
    dist[start] = 0;
    
    for ( i = 0; i < n; ++i) {
        int u = -1;
        double minDist = INF;
        for (j = 0; j < n; ++j) {
            if (!visited[j] && dist[j] < minDist) {
                minDist = dist[j];
                u = j;
            }
        }
        
        if (u == -1) break;
        
        visited[u] = 1;
        
        ArcNode* p = G->vertices[u].firstarc;
        while (p != NULL) {
            int v = p->adjvex;
            double weight = p->weight;
            
            if (!visited[v] && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                prev[v] = u;
            }
            p = p->nextarc;
        }
    }
    
    free(visited);
}

void BuildSameAttributeSubgraph(ALGraph* G) {
	int i,g,j,count,v;
    printf("\n=== 构建同属性景点子图 ===\n");
    
    if (G->vexnum == 0) {
        printf("请先创建图！\n");
        return;
    }
    
    int* groups[3];
    int groupSizes[3] = {0, 0, 0};
    
    for ( i = 0; i < 3; ++i) {
        groups[i] = (int*)malloc(sizeof(int) * G->vexnum);
    }
    
    for (i = 0; i < G->vexnum; ++i) {
        if (G->vertices[i].type == 'h') {
            groups[0][groupSizes[0]++] = i;
        } else if (G->vertices[i].type == 'e') {
            groups[1][groupSizes[1]++] = i;
        } else if (G->vertices[i].type == 'b') {
            groups[2][groupSizes[2]++] = i;
        }
    }
    
    for ( g = 0; g < 3; ++g) {
        if (groupSizes[g] < 2) {
            continue;
        }
        
        const char* typeName;  
        if (g == 0) typeName = "人文类景点";
        else if (g == 1) typeName = "自然类景点";
        else typeName = "双属性景点";
        
        printf("\n%s子图 (包含%d个景点):\n", typeName, groupSizes[g]);
        
        int groupSize = groupSizes[g];
        double** distanceMatrix = (double**)malloc(sizeof(double*) * groupSize);
        for ( i = 0; i < groupSize; ++i) {
            distanceMatrix[i] = (double*)malloc(sizeof(double) * groupSize);
            for ( j = 0; j < groupSize; ++j) {
                distanceMatrix[i][j] = INF;
            }
        }
        
        for ( i = 0; i < groupSize; ++i) {
            int vertex_i = groups[g][i];
            double* dist = (double*)malloc(sizeof(double) * G->vexnum);
            int* prev = (int*)malloc(sizeof(int) * G->vexnum);
            Dijkstra(G, vertex_i, dist, prev);
            
            for ( j = 0; j < groupSize; ++j) {
                int vertex_j = groups[g][j];
                distanceMatrix[i][j] = dist[vertex_j];
            }
            
            free(dist);
            free(prev);
        }
        
        printf("景点列表: ");
        for ( i = 0; i < groupSize; ++i) {
            printf("%s", G->vertices[groups[g][i]].data);
            if (i < groupSize - 1) printf(", ");
        }
        printf("\n");
        
        printf("最短路径距离矩阵:\n");
        printf("%20s", " ");
        for ( j = 0; j < groupSize; ++j) {
            printf("%10.8s", G->vertices[groups[g][j]].data);
        }
        printf("\n");
        
        for ( i = 0; i < groupSize; ++i) {
            printf("%20s", G->vertices[groups[g][i]].data);
            for ( j = 0; j < groupSize; ++j) {
                if (distanceMatrix[i][j] >= INF) {
                    printf("%10s", "INF");
                } else {
                    printf("%10.1lf", distanceMatrix[i][j]);
                }
            }
            printf("\n");
        }
        
        printf("\n建议的同属性景点游览路线 (基于最短路径连接):\n");
        int* inTree = (int*)calloc(groupSize, sizeof(int));
        int* parent = (int*)malloc(sizeof(int) * groupSize);
        double* minDist = (double*)malloc(sizeof(double) * groupSize);
        
        for ( i = 0; i < groupSize; ++i) {
            parent[i] = -1;
            minDist[i] = INF;
        }
        minDist[0] = 0;
        
        for ( count = 0; count < groupSize; ++count) {
            int u = -1;
            double minVal = INF;
            for ( i = 0; i < groupSize; ++i) {
                if (!inTree[i] && minDist[i] < minVal) {
                    minVal = minDist[i];
                    u = i;
                }
            }
            
            if (u == -1) break;
            
            inTree[u] = 1;
            
            for ( v = 0; v < groupSize; ++v) {
                if (!inTree[v] && distanceMatrix[u][v] < minDist[v]) {
                    minDist[v] = distanceMatrix[u][v];
                    parent[v] = u;
                }
            }
        }
        
        printf("连接边 (起点 -> 终点 [距离]):\n");
        for ( i = 1; i < groupSize; ++i) {
            if (parent[i] != -1) {
                printf("  %s -> %s [%.1lfkm]\n", 
                    G->vertices[groups[g][parent[i]]].data,
                    G->vertices[groups[g][i]].data,
                    distanceMatrix[parent[i]][i]);
            }
        }
        printf("\n");
        
        for ( i = 0; i < groupSize; ++i) {
            free(distanceMatrix[i]);
        }
        free(distanceMatrix);
        free(inTree);
        free(parent);
        free(minDist);
    }
    
    for ( i = 0; i < 3; ++i) {
        free(groups[i]);
    }
}

const char* GetScenicIntroduction(const char* spotName) {
	int i,j,k,v,g;
   
    static struct {
        char name[50];
        char description[500];
    } introMap[] = {
        {"江苏大学", "学校坚持以贡献谋发展，不断提升科技创新与服务社会能力。"},
        {"金山寺", "金山寺始建于东晋，是中国佛教禅宗名寺，民间传说《白蛇传》中的金山寺即指此。"},
        {"焦山定慧寺", "焦山定慧寺始建于东汉兴平年间，是江南佛教圣地之一。寺内古树参天，殿宇巍峨，碑刻林立。"},
        {"北固楼", "北固楼位于镇江市北固山上，与岳阳楼、黄鹤楼并称长江三大名楼。"},
        {"西津渡古街", "西津渡古街是镇江文物古迹保存最多、最集中、最完好的地区。"},
        {"南山森林公园", "南山森林公园是省级森林公园，总面积约1500公顷。"},
        {"镇江醋文化博物馆", "镇江醋文化博物馆是国内首个专业性醋文化主题博物馆。"},
        {"茅山景区", "茅山是中国道教名山，道教上清派的发源地。"},
        {"江苏茶博园", "江苏茶博园是集茶叶生产、科技示范、文化展示、旅游观光于一体的综合性园区。"},
        {"城上村遗址", "城上村遗址是新石器时代至西周时期的古文化遗址。"}
    };
    
    static char defaultIntro[] = "该景点是镇江著名的旅游景点，具有丰富的历史文化内涵和优美的自然风光。";
    int mapSize = sizeof(introMap) / sizeof(introMap[0]);
    
    for ( i = 0; i < mapSize; ++i) {
        if (strcmp(introMap[i].name, spotName) == 0) {
            return introMap[i].description;
        }
    }
    
    return defaultIntro;
}

void FindScenicSpot(ALGraph* G) {
    printf("\n=== 景点查找与路径规划 ===\n");
    
    if (G->vexnum == 0) {
        printf("请先创建图！\n");
        return;
    }
    
    char spotName[50];
    printf("请输入要查找的景点名称: ");
    getchar();
    fgets(spotName, sizeof(spotName), stdin);
    spotName[strcspn(spotName, "\n")] = '\0';
    
    int spotIndex = LocateVexALG(G, spotName);
    
    if (spotIndex == -1) {
        printf("× 景点 \"%s\" 不存在于图中！\n", spotName);
        return;
    }
    
    printf("\n√ 景点 \"%s\" 存在！\n", spotName);
    printf("  编号: %d\n", G->vertices[spotIndex].id);
    printf("  类型: ");
    switch(G->vertices[spotIndex].type) {
        case 'h': printf("人文类景点"); break;
        case 'e': printf("自然类景点"); break;
        case 'b': printf("双属性景点"); break;
        default: printf("未知类型"); break;
    }
    printf("\n");
    
    int jiangsuUnivIndex = LocateVexALG(G, "江苏大学");
    
    if (jiangsuUnivIndex == -1) {
        printf("× 图中没有找到江苏大学，无法计算路径。\n");
        return;
    }
    
    double* dist = (double*)malloc(sizeof(double) * G->vexnum);
    int* prev = (int*)malloc(sizeof(int) * G->vexnum);
    Dijkstra(G, jiangsuUnivIndex, dist, prev);
    
    if (dist[spotIndex] >= INF) {
        printf("  从江苏大学到%s无可达路径！\n", spotName);
        free(dist);
        free(prev);
        return;
    }
    
    printf("\n 从江苏大学到%s的最短路径规划：\n", spotName);
    
    int* pathStack = (int*)malloc(sizeof(int) * G->vexnum);
    int stackTop = -1;
    int current = spotIndex;
    while (current != -1) {
        pathStack[++stackTop] = current;
        current = prev[current];
    }
    
    printf("  路径: ");
    int first = 1;
    double totalDistance = dist[spotIndex];
    
    while (stackTop >= 0) {
        int vertex = pathStack[stackTop--];
        if (!first) printf(" -> ");
        printf("%s", G->vertices[vertex].data);
        first = 0;
    }
    
    printf("\n  总距离: %.1lf km\n", totalDistance);
    
    double estimatedTime = totalDistance / 30.0 * 60.0;
    printf("  预计时间: %.0lf 分钟\n", estimatedTime);
    
    printf("\n 景点介绍：\n");
    printf("  %s\n", GetScenicIntroduction(spotName));
    
    free(dist);
    free(prev);
    free(pathStack);
}

int main() {
    ALGraph G = {0};
    int choice = 0;
    int graphCreated = 0;
    
    do {
        printf("\n=== 镇江景点图管理系统 ===\n");
        printf("1. 创建连通镇江景点图\n");
        printf("2. 显示简洁图结构\n");
        printf("3. 构建同属性景点子图\n");
        printf("4. 查找景点、显示信息并规划路径\n");
        printf("5. 退出\n");
        printf("当前状态: %s\n", graphCreated ? "已创建图" : "未创建图");
        printf("请选择操作: ");
        scanf("%d", &choice);
        
        switch(choice) {
            
            case 1: {
                CreateConnectedZhenjiangGraph(&G);
                PrintGraph(&G);
                graphCreated = 1;
                break;
            }
            
            case 2: {
                if (!graphCreated) {
                    printf("请先创建图！\n");
                    break;
                }
                PrintGraphSimple(&G);
                break;
            }
            case 3: {
                if (!graphCreated) {
                    printf("请先创建图！\n");
                    break;
                }              
                char type;
                printf("请输入景点类型(h:人文, e:自然, b:双属性): ");
                getchar();
                scanf("%c", &type);
                PrintByType(&G, type);
                BuildSameAttributeSubgraph(&G);
                break;
            }
            case 4: {
                if (!graphCreated) {
                    printf("请先创建图！\n");
                    break;
                }
                FindScenicSpot(&G);
                break;
            }
            case 5: {
                printf("程序退出。\n");
                break;
            }
            default: {
                printf("无效选择，请重新选择。\n");
                break;
            }
        }
        
        if (choice != 5) {
            printf("\n操作完成，按回车键继续...");
            getchar();
            getchar();
        }
        
    } while (choice != 5);
    
    if (graphCreated) {
        DestroyGraph(&G);
    }
    
    return 0;
}

