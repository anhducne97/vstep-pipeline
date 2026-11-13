# Firebase SDK đóng gói sẵn

`firebase.mjs` là Firebase JS SDK 12.19.0 (Apache License 2.0), chỉ gồm các hàm trong `firebase-entry.js`,
đóng gói để trang tải được trên GitHub Pages mà không cần bước build bằng Node.

Đóng gói lại (khi muốn nâng phiên bản):

    npm install firebase@<phiên bản> esbuild
    npx esbuild src/vendor/firebase-entry.js --bundle --format=esm --minify --target=es2020 --outfile=src/vendor/firebase.mjs
