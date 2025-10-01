# DocSync_V1

![License](https://img.shields.io/badge/license-MIT-green)
![Java](https://img.shields.io/badge/java-17-blue)
![Next.js](https://img.shields.io/badge/next-15.5.4-black)

<br/>

# 특징

*간단한 문서 동기화 실험 프로젝트입니다. HTTP PATCH 기반 메시징을 이용해 문서를 업데이트합니다.*

![구조도](https://github.com/JBL28/PlayGround/blob/main/resources/images/DocSync_V1_Architecture.png?raw=true)

**메시지 예시**
``` JSON
/* 인덱스 0에 "Hello world!" 문자열을 추가 */
{
    "documentId" : "dab0868b-ae16-4071-93a8-59b69d2a0cb0",
    "op" : "INSERT",
    "at" : "0",
    "text" : "Hello world!"
}
```

# Getting Started
## 실습 환경
- **SpringServer**
  - Java 17
  - Intelli J

- **NextClientForTest**
  - next: 15.5.4
  - postcss: ^8.5.6
  - react: 19.1.0
  - react-dom: 19.1.0
  - VS Code

## Install
- SpringServer
    - Gradle로 관리합니다.
- NextClientForText
    - `npm install`

## Run
- SpringServer
    - Intellij로 실행합니다.
- NextClientForText
    - `npm run dev`

# 한계와 향후 개선 아이디어
- 동시 편집을 지원하지 않습니다.
    - 추후 메시지 큐를 사용한 메시지 직렬화, WebSocket등을 활용해 동시 편집을 지원하도록 개선할 수 있습니다.
- 안정성 부족
    - 문자열을 편집하는 여러 테스트 케이스에 대한 검증이 필요합니다.

## License
*MIT License*
