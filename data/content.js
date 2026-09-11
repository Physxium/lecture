const lectureConfig = {
    title: "당연한 것에 질문하기",
    footer: "2026-09-12 길 위의 인문학"
};

const contents = [
    {
        type: "presentation",
        layout: "text",
        align: "center",

        title: "당연한 것에 질문하기",
        subtitle: "과학적 사고의 즐거움",

        paragraphs: [
            "강연자: 이한결 물리학자"
        ]
    },

    {
        type: "presentation",

        title: "강사 소개",
        subtitle: "이한결 · 물리학자 / 작가",

        paragraphs: [
            "서울대학교 물리교육학과 학사\n서울대학교 물리학과 석사/박사\nUC 버클리 재료공학과 박사후연구원\n현재 삼성전자 반도체 연구소 수석 연구원",
            "그런데 어쩌다 글을 쓰게 됐을까?"
        ],

        image: "images/book.png"
    },

    {
        type: "presentation",

        title: "대머리에 대한 고찰",
        subtitle: "도대체 대머리가 정확히 무엇일까?",

        paragraphs: [
            "머리가 하나도 없으면 대머리",
            "그럼 1개만 있다면?",
            "그럼 100개만 있다면?"
        ],

        image: "images/baldness1.png"
    },

    {
        type: "presentation",
        layout: "double-column",

        title: "중요한 건 개수 자체가 아니라 변화",

        columns: [
            {
                subtitle: "그런데 머리 길이는 계속 감소한다?!",
                image: "images/baldness2.png",
                text: "빠진 모발과 새로운 모발의 수가 정확히 같다고 해도, 모발 길이의 평균은 계속해서 감소할 것이다. 대머리가 되지 않으려면, 머리카락의 수가 일정하게 유지되는 것과 더불어 일정량의 모발 성장도 필요하다."
            },
            {
                subtitle: "그리고 머리 길이도 들쭉날쭉해진다",
                image: "images/baldness3.png",
                text: "날이 갈수록 각 머리카락의 길이는 천차만별이 되어간다. 수학적으로는, 머리 길이의  분산이 증가한다."
            }
        ]
    },

    {
        type: "presentation",

        title: "아주 긴 시간이 흐른다면...",
        subtitle: "분산이 최대인 경우를 상상해보자",

        paragraphs: [
            "평균은 일정하고, 분산이 최대인 경우",
            "우리 머리는 왜 이렇게 되지 않을까?",
        ],

        image: "images/baldness4.png"
    },

    {
        type: "presentation",

        title: "비행기의 약점",
        subtitle: "어떻게 약점을 보강할까",

        paragraphs: [
            "2차대전 당시 전투기 생존율을 높이기 위해 연합군은 귀환한 전투기 기체 어느 부위가 적탄을 많이 맞는지를 조사했다.",
            "총알구멍 개수는 엔진 부위 평균 1.11발, 동체 1.73발, 연료계 1.55발, 기체 나머지 부분 1.8발.",
            "취약 부분에 철갑을 둘러야 하는데 너무 많이 두르면 비행기가 무거워진다.",
            "총알구멍이 가장 많은 부위 위주로 보강하면 효율적일까?",
        ],

        image: "images/Survivorship-bias.png"
    },

    {
        type: "presentation",

        title: "돌아오지 않은 비행기",
        subtitle: "확률 속에 숨어있는 것들",

        paragraphs: [
            "아브라함 발드는 상식과 반대로, 엔진에 집중해야 한다고 조언했다.",
            "맹점은 돌아오지 못한 전투기들을 고려하지 않은 것.",
            "엔진에 총알을 2발 이상 맞은 전투기는 모두 격추당한 셈",
            "확률과 같은 것을 다룰 때는 분모에 들어가는 것을 의심해보자.",
        ],

        image: "images/abraham-wald.png"
    },

    {
        type: "presentation",

        title: "의사와 농부",
        subtitle: "확률 속에 숨어있는 것들",

        paragraphs: [
            "한국인 중 무작위로 선정된 한 명을 만나게 되었다. 그는 흰색가운을 입고 있다.그의 직업은 의사 아니면 농부 둘 중 하나라고 한다.그의 복장과 가능한 직업 두 가지를 제외하면, 더 이상 어떠한 정보도 제공되지 않았다.그의 직업을 맞히는 내기를 한다면, 당신은 그의 직업이 무엇이라는 것에 걸겠는가?",
            "그래도 의사가 흰색가운을 입는 상황이 농부보다는 많지 않을까?",
            "만약 의사가 흰색가운을 입고 있을 확률이 90퍼센트라고 가정해보자.그리고 농부가 흰색가운을 입고 있을 확률은 반대로 10퍼센트라고 해보자.",
            
        ],

        image: "images/white-robe.jpg"
    },

    
    {
        type: "presentation",
        layout: "double-column",

        title: "분모에 들어가는 것",

        columns: [
            {
                subtitle: "실제 의사와 농부의 수",
                image: "images/doctor-farmer.png",
                text: "한국인의 직업별 통계에서, 의사는 약 10만 명이고, 농업 종사자는 약 200만 명,\n\n9/(9+20)"
            },
            {
                subtitle: "봐줄만한 삼각형",
                image: "images/good-triangle.png",
                text: "어림없는 오각형도 고려해야 정확한 판단을 할 수 있다."
            }
        ]
    },

    {
        type: "presentation",

        title: "과학적 사고란",
        subtitle: "당연함의 해상도를 높이는 일",

        paragraphs: [
            "진짜?",
            "이건 왜 이럴까?",
            "이 이유가 맞다면, 왜 저건 설명 못할까",
            "그렇다면 이렇게도 생각해 볼 수 있을까?",
            "의심-분석-(모순 발견)-해결-확장"            
        ],

        image: null
    },
    
    {
        type: "presentation",

        title: "쉬는 시간",
        subtitle: "5분간 휴식",

        paragraphs: [
            "쉬면서 옆의 QR 코드에 접속해 주세요",
            "'강의 진행 중, 잠시만 기다려 주세요'\n가 나오면  성공",
        ],

        image: "images/QR.jpg"
    },

    {
        type: "question",
        id: "q1",

        title: "얼음",
        subtitle: "물 위의 얼음이 녹으면 수위는 어떻게 될까?\n그렇다면 빙하가 녹으면 정말 해수면이 상승할까?",
        image: ice_1
    },

{
        type: "presentation",

        title: "물 위의 얼음이 녹으면?",
        subtitle: "그런데 빙하가 녹으면 왜 해수면이 상승할까?",

        paragraphs: [
            "물의 부피 = 얼음이 물 속에 잠긴 부분의 부피",
            "하지만 빙하는 바다 위에 둥둥 떠 있는 것 말고도, 대부분 육지 위에 있다. 그렇기에 지구온난화는 해수면을 높이게 된다.",
        ],

        image: "images/ice_2.jpg"
    },

    {
        type: "question",
        id: "q2",

        title: "피 냄새",
        subtitle: "상어는 피 냄새를 맡는다는데, 피 냄새는 대체 뭘까?\n피에서 철 냄새가 난다면 왜 상어는 철로 된 배를 쫓지 않을까?",
        image: null
    },

{
        type: "presentation",

        title: "피 냄새",
        subtitle: "피 속에는 철분이 들어 있는것이 맞다. 하지만 피 냄새는 좀 더 복잡하다.",

        paragraphs: [
            "상어가 맡는 피 냄새는 피 속의 아미노산",
            "사람이 느끼는 피 냄새는 아주 다양한 화학 성분들",
        ],

        image: null
    },

    {
        type: "question",
        id: "q3",

        title: "다이어트",
        subtitle: "마이너스 칼로리도 있을까?",
        image: null
    },
    {
        type: "question",
        id: "q4",

        title: "가장 좋은 제품은?",
        subtitle: "A: 평점 10 / 리뷰 5개\nB: 평점 8.7 / 리뷰 1,000개\nC: 평점 9 / 리뷰 50개",
        image: null
    },

    {
        type: "question",
        id: "q5",

        title: "로또",
        subtitle: "한번에 1등이 63명이 나올 수 있을까?\n로또가 조작된 건 아닐까?",
        image: null
    },

    
];