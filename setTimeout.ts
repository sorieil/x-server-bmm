setTimeout((): void => {
    for (let i = 0; i < 10; i++) {
        console.log('setTimeout1: ', i);
    }
}, 0);
setTimeout((): void => {
    for (let i = 0; i < 10; i++) {
        console.log('setTimeout: ', i);
    }
}, 0);

for (let i = 0; i < 10; i++) {
    console.log('1번: ', i);
}

for (let i = 0; i < 10; i++) {
    console.log('2번: ', i);
}

for (let i = 0; i < 10; i++) {
    console.log('3번: ', i);
}

for (let i = 0; i < 10; i++) {
    console.log('4번: ', i);
}

for (let i = 0; i < 10; i++) {
    console.log('5번: ', i);
}
