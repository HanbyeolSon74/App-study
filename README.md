# 📱 Community App (MVP)

간단한 커뮤니티 앱 MVP 프로젝트입니다.  
React Native(Expo)와 Firebase를 활용하여 회원가입/로그인, 글 작성, 이미지 첨부, 댓글 기능을 구현했습니다.  

---

## 🚀 주요 기능

- 🔐 **회원가입 & 로그인** (Firebase Authentication)  
- 📝 **게시글 작성/목록/상세 조회**  
- 🖼️ **이미지 첨부** (Expo ImagePicker + Firebase Storage)  
- 💬 **댓글 작성 & 조회**  
- ↩️ **로그아웃**  

---

## 🛠️ 기술 스택

- **Frontend**: React Native (Expo)  
- **Backend / DB**: Firebase (Authentication, Firestore, Storage)  
- **Language**: TypeScript  

---

## 📂 프로젝트 구조
app/
├── auth/
│ ├── login.tsx # 로그인
│ └── signup.tsx # 회원가입
├── posts/
│ ├── index.tsx # 게시글 목록
│ ├── [id].tsx # 게시글 상세
│ └── create.tsx # 게시글 작성
├── _utils/
│ └── firebase.ts # Firebase 설정
└── ...

---

## ⚙️ 실행 방법

1. 저장소 클론
   ```bash
   git clone https://github.com/username/community-app.git
   cd community-app

2. 패키지 설치
npm install

3. Firebase 설정 파일 수정
app/_utils/firebase.ts 파일에 본인 Firebase 프로젝트 키 입력

4.실행
npx expo start

🎥 시연 영상

👉 시연 영상 보러가기
(제출용 영상 업로드 후 링크 추가)

## 📸 실행 화면 예시

| 로그인 | 회원가입 | 게시글 목록 |
|--------|----------|-------------|
| ![login](./assets/screens/login.png) | ![signup](./assets/screens/signup.png) | ![list](./assets/screens/list.png) |

| 게시글 작성 | 게시글 상세 | 댓글 |
|-------------|-------------|------|
| ![create](./assets/screens/create.png) | ![detail](./assets/screens/detail.png) | ![comment](./assets/screens/comment.png) |

	
	


📌 개발자
손한별
