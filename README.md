# STUDYON Admin Web

관리자용 Next.js 16 웹 앱이다. 운영 배포는 standalone output 기준으로 준비되어 있다.

## Local run

```bash
npm ci
API_URL=http://127.0.0.1:3000 npm run dev
```

기본 개발 포트는 `11111`이다.

## Production build

```bash
API_URL=https://api.example.com npm run build
```

standalone 배포 런타임은 `.next/standalone`에 생성된다. 정적 파일까지 포함하려면 루트 스크립트를 사용한다.

```bash
cd /Users/bagjun-won/studyon
./scripts/build_web_release.sh
```

실행:

```bash
PORT=11111 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

## Environment

- `API_URL`: backend origin for `/api/*` rewrite target
- `PORT`: server port
- `HOSTNAME`: bind address

예시는 [.env.example](/Users/bagjun-won/studyon/apps/admin_web/.env.example:1)에 있다.
