function sleep(func, delay) {
  const delayUntil = Date.now() + delay;

  while (Date.now() < delayUntil);

  func();
}

function foo() {
  console.log("foo");
}

function bar() {
  console.log("bar");
}

sleep(foo, 3 * 1000);

// bar 함수는 sleep 함수의 실행이 종료된 이후에 호출되므로, 3초 이상 블로킹된다.
bar();

//

// function foo() {
// 	console.log('foo');
// }

// function bar() {
// 	console.log('bar');
// }

// // 타이머 함수 setTimeout은 일정 시간이 경과한 이후에 콜백 함수 foo를 호출
// // 타이머 함수 setTimeout은 bar 함수를 블로킹하지 않음
// setTimeout(foo, 3 * 1000);
// bar();

console.log(0.1 + 0.2 == 0.3);
console.log(0.5 + 0.1 == 0.6);
