declare module 'random-choice' {
    export default function randomChoice<T>(values: Array<T>, weights: Array<number>): T;
}
