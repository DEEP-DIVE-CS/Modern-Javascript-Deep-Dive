# 49. Babel과 Webpack을 이용한 ES6+/ES.NEXT 개발 환경 구축

대부분의 브라우저는 ES6를 지원한다.(약 98%) 하지만, IE 11 같은 경우 ES6의 지원율은 약 11%다.

따라서 최신 ECMAScript  사양을 사용하여 프로젝트를 진행하려면  최신 사양으로 작성된 코드를 경우에 따라 IE를 포함한 **구형 브라우저에서 문제 없이 동작시키기 위한 개발환경**을 구축해야 한다.

이번 장에서는 트랜스파일러인 Babel과 모듈 번들러인 Webpack을 이용하여 ES6+/ES.NEXT 개발환경을 구축해보자!



## 49.1 Babel

```javascript
// map ES6 / ** ES7
[1, 2, 3].map(n => n ** n);
```

IE와 같은 구형 브라우저에서는 ES6의 화살표 함수와 ES7의 지수 연산자를 지원하지 않을 수 있다. Babel을 이용해서 다음과 같은 ES5 사양으로 변환할 수 있다.

```javascript
"use strict";

[1, 2, 3].map(function (n) {
  return Math.pow(n, n);
});
```

이처럼 Babel은 ES6+/ES.NEXT로 구현된 최신 사양의 소스코드를 IE 같은 구형 브라우저에서도 동작하는 ES5 사양의 소스코드로 변환(트랜스파일링)할 수 있다.



### 49.1.1 Babel  설치

Babel을 설치해보자.

```bash
$ mkdir esnext-project && cd esnext-project
$ npm init -y
$ npm i  --save-dev @babel/core@7.10.3 @babel/cli@7.10.3
```



### 49.1.2 Babel 프리셋 설치와 babel.config.json 설정 파일 작성

Babel을 사용하려면 *@babel/preset-env*를 설치해야 한다. *@babel/preset-env*는 함께 사용되어야 하는 Babel 플러그인을 모아둔 것으로 Babel 프리셋이라고 부른다. 

Babel이 공식적으로 제공하는 프리셋은 다음과 같다.

- @babel/preset-env
- @babel/preset-flow
- @babel/preset-react
- @babel/preset-typescript

*@babel/preset-env*은 필요한 플러그인들을 프로젝트 지원  환경에 맞춰 동적으로 결정해준다. 프로젝트 지원 환경은 Browserlist 형식으로 *.browserslistrc* 파일에 상세히 설정할 수 있다.



일단 기본 설정으로 진행하자!

```bash
$ npm i --save-dev @babel/preset-env@7.10.3
```

설치가 완료되면 프로젝트 루트 폴더에 *babel.config.json* 설정 파일을 생성하고 다음과 같이 작성한다.

```json
{
  "presets": ["@babel/preset-env"]
}
```



### 49.1.3 트랜스파일링

Babel을 사용하여 ES6+/ES.NEXT 사양의 소스코드를 ES5 사양의 소스코드로 트랜스파일링해보자. 

npm scripts에 Babel CLI 명령어를 등록하여 사용하자.

```json
{
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "babel src/js -w -d dist/js"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/cli": "^7.10.3",
    "@babel/core": "^7.10.3",
    "@babel/preset-env": "^7.10.3"
  }
}

```

- -w (--watch) : 타깃 폴더에 있는 모든 자바스크립트 파일들의 변경을 감지하여 자동으로 트랜스파일한다.
- -d(--out-dir) : 트랜스파일링된 결과물이 저장될 폴더를 지정한다. 만약 지정된 폴더가 존재하지 않으면 자동 생성한다.

이제 트랜스파일링을 테스트하기 위해 ES6+/ES.NEXT 사양의 자바스크립트 파일을 작성해보자. 프로젝트 루트 폴더에 src/js 폴더를 생성한 후 lib.js와 main.js를 추가한다.

```javascript
// src/js/lib.js
export const pi = Math.PI; // ES6 모듈

export function power(x, y) {
  return x ** y; // ES7: 지수 연산자
}

// ES6 클래스
export class Foo {
  #private = 10; // stage 3: 클래스 필드 정의 제안

  foo() {
    // stage 4: 객체 Rest/Spread 프로퍼티 제안
    const { a, b, ...x } = { ...{ a: 1, b: 2 }, c: 3, d: 4 };
    return { a, b, x };
  }

  bar() {
    return this.#private;
  }
}
```



```javascript
// src/js/main.js
import { pi, power, Foo } from './lib';

console.log(pi);
console.log(power(pi, pi));

const f = new Foo();
console.log(f.foo());
console.log(f.bar());
```



터미널에서 npm run build를 입력하여 트랜스파일링을 실행한다.

책과 다르게 제대로 잘 실행되는 것을 볼 수 있다.

그 이유는 책이 쓰여진 당시, 20년 7월 stage3 단계에 있는 private 필드 정의 제안에 대한 플러그인을 지원하지 않았지만 지금은 지원하기 때문!

하지만 dist/js/main.js를 실행했을 때, 다음과 같은 오류가 발생한다.

```bash
SyntaxError: Private field '#private' must be declared in an enclosing class
```



Babel 홈페이지에서 플러그인을 검색해 별도의 플러그인을 설치해줘야 한다.

class field를 검색하면 나오는 플러그인을 확인해 설치해보자.

```
$ npm i @babel/plugin-proposal-class-properties
```

설치 후에 babel.config.json 설정  파일에 추가해야 한다. 

```json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-proposal-class-properties"]
}
```



npm run build 명령어를 실행해 트랜스파일링 한 뒤, node dist/js/main.js 를 실행해보자.

```javascript
$ node dist/js/main.js 
3.141592653589793
36.4621596072079
{ a: 1, b: 2, x: { c: 3, d: 4 } }
10
```



### 49.1.5 브라우저에서 모듈 로딩 테스트

위 예제의 동작은 node.js 환경에서 동작한 것이고 Babel이 모듈을 트랜스파일링한 것도 Node.js가 기본 지원하는 CommonJS 방식의 모듈 로딩 시스템에 따른 것이다. 

다음은 트랜스파일링 결과물인 src/js/main.js 이다.

```javascript
"use strict";

var _lib = require("./lib");

// src/js/main.js
console.log(_lib.pi);
console.log((0, _lib.power)(_lib.pi, _lib.pi));
var f = new _lib.Foo();
console.log(f.foo());
console.log(f.bar());
```

브라우저는 CommonJS 방식의 *require* 함수를 지원하지 않으므로 위에서 트랜스파일링된 결과를 그대로 브라우저에서 실행하면 에러가 발생한다. 프로젝트 루트 폴더에 *index.html*을 작성하여 트랜스파일링된 자바스크립트 파일을 브라우저에서 실행해보자.

```html
<!DOCTYPE html>
<html>
<body>
  <script src="dist/js/lib.js"></script>
  <script src="dist/js/main.js"></script>
</body>
</html>
```

위 HTML을 브라우저에서 실행하면 다음과 같은 에러가 발생한다.

```
Uncaught ReferenceError: exports is not defined
    at lib.js:3:23
main.js:3 Uncaught ReferenceError: require is not defined
    at main.js:3:12
```

브라우저의 ES6 모듈(ESM)을  사용하도록 Babel을 설정할 수도 있으나 ESM의 문제점이 있기 때문에 Webpack을 통해 이러한 문제를 해결해보자.



## 49.2 Webpack

Webpack은 의존 관계에 있는 js, css, 이미지 등의 리소스들을 하나(또는 여러 개)의 파일로 번들링하는 모듈 번들러다. Webpack을 사용하면 의존 모듈이 하나의 파일로 번들링되므로 별도의 모듈 로더가 필요 없다. 그리고 여러 개의 자바스크립트 파일을 하나로 번들링 하므로 HTML 파일에서 여러 개의 자바스크립트 파일을 로드해야 하는 번거로움도 사라진다.



### 49.2.1 Webpack 설치

```bash
$ npm i --save-dev webpack@4.43.0 webpack-cli@3.3.12
```

package.json

```json
{
  "name": "babel",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "webpack -w"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/cli": "^7.10.3",
    "@babel/core": "^7.10.3",
    "@babel/preset-env": "^7.10.3",
    "webpack": "^4.43.0",
    "webpack-cli": "^3.3.12"
  },
  "dependencies": {
    "@babel/plugin-proposal-class-properties": "^7.16.7"
  }
}
```



### 49.2.2 babel-loader 설치

webpack이 모듈을 번들링할 때 Babel을 사용하여 ES6+/ES.NEXT 사양의 소스코드를 ES5 사양의 소스코드로 트랜스파일링하도록 babel-loader를 설치한다.

```bash
$ npm i --save-dev babel-loader@8.1.0
```



### 49.2.3 webpack.config.js 설정 파일 작성

webpack.config.js는 Webpack이 실행될 때 참조하는 설정 파일이다. 프로젝트 루트 폴더에 webpack.config.js 파일을 생성하고 다음과 같이 작성한다.

```javascript
const path = require('path');

module.exports = {
  // entry file
  // https://webpack.js.org/configuration/entry-context/#entry
  entry: './src/js/main.js',
  // 번들링된 js 파일의 이름(filename)과 저장될 경로(path)를 지정
  // https://webpack.js.org/configuration/output/#outputpath
  // https://webpack.js.org/configuration/output/#outputfilename
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js'
  },
  // https://webpack.js.org/configuration/module
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src/js')
        ],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  },
  devtool: 'source-map',
  // https://webpack.js.org/configuration/mode
  mode: 'development'
};
```

이제 Webpack을 실행하여 트랜스파일링 및 번들링을 실행해보자. 트랜스파일링은 Babel이 수행하고 번들링은 Webpack이 수행한다. 

```bash
$ npm run build

> babel@1.0.0 build
> webpack -w


webpack is watching the files…

Hash: e97096196c62ba87ef1e
Version: webpack 4.43.0
Time: 1463ms
Built at: 2022. 01. 16. 오후 8:02:24
           Asset      Size  Chunks                   Chunk Names
    js/bundle.js  9.31 KiB    main  [emitted]        main
js/bundle.js.map  5.22 KiB    main  [emitted] [dev]  main
Entrypoint main = js/bundle.js js/bundle.js.map
[./src/js/lib.js] 4.46 KiB {main} [built]
[./src/js/main.js] 165 bytes {main} [built]
```

Webpack을 실행한 결과, dist/js 폴더에 bundle.js가 생성되었다. 이 파일은 main.js lib.js 모듈이 하나로 번들링된 결과물이다. index.html의 js 파일을 수정하고 브라우저에서 실행해보자.

```html
<!DOCTYPE html>
<html>
<body>
  <script src="./dist/js/bundle.js"></script>
</body>
</html>
```

문제없이 실행되는 것을 볼 수 있다.

```javascript
main.js:4 3.141592653589793
main.js:5 36.4621596072079
main.js:8 {a: 1, b: 2, x: {…}}
main.js:9 10
```



### 49.2.4 babel-polyfill 설치

Babel을 사용하여 ES6+/ES.NEXT 사양의 소스코드를 ES5 사양의 소스코드로 트랜스파일링해도 브라우저가 지원하지 않는 코드가 남아 있을 수 있다. ES6부터 추가된 Promise, Object.assign, Array.from 등은 ES5 사양으로 트랜스파일링해도 ES5 사양에 대체할 기능이 없기 때문에 트랜스파일링이 되지 못하고 남는다.

Promise, Object.assign, Array.from 등이 어떻게 트랜스파일링되는지 확인해보자.

```javascript
// src/js/main.js
import { pi, power, Foo } from './lib';

console.log(pi);
console.log(power(pi, pi));

const f = new Foo();
console.log(f.foo());
console.log(f.bar());

// polyfill이 필요한 코드
console.log(new Promise((resolve, reject) => {
  setTimeout(() => resolve(1), 100);
}));

// polyfill이 필요한 코드
console.log(Object.assign({}, { x: 1 }, { y: 2 }));

// polyfill이 필요한 코드
console.log(Array.from([1, 2, 3], v => v + v));
```

트랜스파일링 결과

```javascript
...
// 190 line
console.log(new Promise(function (resolve, reject) {
  setTimeout(function () {
    return resolve(1);
  }, 100);
})); // polyfill이 필요한 코드

console.log(Object.assign({}, {
  x: 1
}, {
  y: 2
})); // polyfill이 필요한 코드

console.log(Array.from([1, 2, 3], function (v) {
  return v + v;
}));
...
```

이처럼 Promise, Object.assign, Array.from 등과 같이 ES5 사양으로 대체할 수 없는 기능은 트랜스파일링되지 않는다. 따라서 IE 같은 구형 브라우저에서도 Promise, Object.assign, Array.from 등과 같은 객체나 메서드를 사용하기 위해서는 @babel/polyfill을 설치해야 한다.

```bash
$ npm i @babel/polyfill@7.10.1
```

@babel/polyfill은 개발 환경에서만 사용하는 것이 아니라 실제 운영  환경에서도 사용해야 한다. 따라서 --save-dev 옵션을 지정하지 않는다.

ES6의 경우 import를 사용하는 경우에는 진입점의 선두에서 먼저 폴리필을 로드하도록 한다.

```javascript
// src/js/main.js
import "@babel/polyfill";
import { pi, power, Foo } from './lib';
...
```

Webpack을 사용하는 경우, webpack.config.js 파일의 entry 배열에 폴리필을 추가한다.

```javascript
const path = require('path');

module.exports = {
  // entry file
  // https://webpack.js.org/configuration/entry-context/#entry
  entry: ['@babel/polyfill', './src/js/main.js'],
...
```

다시 npm run build를 실행하여 webpack 결과물을 확인해보자.

bundle.js를 확인해보면 다음과 같이 폴리필이 추가된 것을 볼 수 있다.

```javascript
// dist/js/bundle.js
...
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../modules/es6.symbol */ "./node_modules/core-js/modules/es6.symbol.js");
__webpack_require__(/*! ../modules/es6.object.assign */ "./node_modules/core-js/modules/es6.object.assign.js");
__webpack_require__(/*! ../modules/es6.object.create */ "./node_modules/core-js/modules/es6.object.create.js");
__webpack_require__(/*! ../modules/es6.promise */ "./node_modules/core-js/modules/es6.promise.js");
__webpack_require__(/*! ../modules/es6.array.from */ "./node_modules/core-js/modules/es6.array.from.js");
__webpack_require__(/*! ../modules/es6.map */ "./node_modules/core-js/modules/es6.map.js");
__webpack_require__(/*! ../modules/es6.set */ "./node_modules/core-js/modules/es6.set.js");
__webpack_require__(/*! ../modules/es6.weak-map */ "./node_modules/core-js/modules/es6.weak-map.js");
__webpack_require__(/*! ../modules/es6.weak-set */ "./node_modules/core-js/modules/es6.weak-set.js");
__webpack_require__(/*! ../modules/es6.typed.array-buffer */ "./node_modules/core-js/modules/es6.typed.array-buffer.js");
__webpack_require__(/*! ../modules/es6.typed.data-view */ "./node_modules/core-
/***/ }),
...
```