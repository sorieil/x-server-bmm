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

for (let i = 0; i < 1000000000; i++) {
    console.log('11111: ', i);
}

for (let i = 0; i < 10; i++) {
    console.log('22222: ', i);
}

for (let i = 0; i < 10; i++) {
    console.log('33333: ', i);
}

// (async () => {
//     const k1 = await new Promise(resolve => {
//         for (let i = 0; i < 10; i++) {
//             setTimeout(() => {
//                 console.log('inner settimout - 111111번: ', i);
//             }, 500);
//         }
//         resolve(true)
//     });

//     const k2 = await new Promise(resolve => {
//         for (let i = 0; i < 10; i++) {
//             setTimeout(() => {
//                 console.log('inner settimout - 222222: ', i);
//             }, 500);
//         }
//         resolve(true)
//     });

//     const k3 = await new Promise(resolve => {
//         for (let i = 0; i < 100000; i++) {
//             setTimeout(() => {
//                 console.log('inner settimout - 333333: ', i);
//             }, 500);
//         }
//         resolve(true)
//     });

//     const k4 = await new Promise(resolve => {
//         for (let i = 0; i < 10; i++) {
//             setTimeout(() => {
//                 console.log('inner settimout - 444444: ', i);
//             }, 500);
//         }
//         resolve(true)
//     });
// })();
