interface Comparator<T> {
  (arg1: T, arg2: T): number;
}

/** Implements a heap */
class Heap<T> {
  private data: T[];
  // heap comparator should return > 0 for the root compared children
  private comparator: Comparator<T>;

  /**
   *
   * @param comp - comparator to use for heap
   */
  constructor(comp: Comparator<T>) {
    this.data = [];
    this.comparator = comp;
  }

  private static getParentIndex(i: number) {
    return Math.floor((i - 1) / 2);
  }

  private static getLeftChildIndex(i: number) {
    return (i * 2) + 1;
  }

  private static getRightChildIndex(i: number) {
    return (i * 2) + 2;
  }

  private bubbleUp(i: number) {
    let p = Heap.getParentIndex(i);
    // if heap is not correct
    while ((i > 0) && (this.comparator(this.data[p], this.data[i]) < 0)) {
      // swap
      let tmp = this.data[i];
      this.data[i] = this.data[p]
      this.data[p] = tmp;
      // reset indices
      i = p, p = Heap.getParentIndex(i);
    }
  }

  private bubbleDown(i: number) {
    let largest = i;
    let left = Heap.getLeftChildIndex(i);
    let right = Heap.getRightChildIndex(i);

    if ((left < this.data.length) && this.comparator(this.data[largest], this.data[left]) < 0)
      largest = left;

    if ((right < this.data.length) && this.comparator(this.data[largest], this.data[right]) < 0)
      largest = right;

    if (largest !== i) {
      let tmp = this.data[largest];
      this.data[largest] = this.data[i];
      this.data[i] = tmp;
      this.bubbleDown(largest);
    }
  }

  /**
   *
   * @param x - data to insert into heap
   */
  insert(x: T) {
    let i = this.data.length;
    this.data.push(x);
    this.bubbleUp(i);
  }

  /**
   * @returns - the data at the top of heap
   */
  extract(): T {
    let top = this.data[0];
    this.data[0] = this.data.pop();
    this.bubbleDown(0);
    return top;
  }

  /**
   * @returns - whether the heap is empty
   */
  isEmpty(): boolean {
    return this.data.length === 0;
  }
}

module.exports = Heap;
