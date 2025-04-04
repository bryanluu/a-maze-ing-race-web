/** Implements a heap */
class Heap {
    /**
     *
     * @param comp - comparator to use for heap
     */
    constructor(comp) {
        this.data = [];
        this.comparator = comp;
    }
    static getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    static getLeftChildIndex(i) {
        return (i * 2) + 1;
    }
    static getRightChildIndex(i) {
        return (i * 2) + 2;
    }
    bubbleUp(i) {
        let p = Heap.getParentIndex(i);
        // if heap is not correct
        while ((i > 0) && (this.comparator(this.data[p], this.data[i]) < 0)) {
            // swap
            let tmp = this.data[i];
            this.data[i] = this.data[p];
            this.data[p] = tmp;
            // reset indices
            i = p, p = Heap.getParentIndex(i);
        }
    }
    bubbleDown(i) {
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
    insert(x) {
        let i = this.data.length;
        this.data.push(x);
        this.bubbleUp(i);
    }
    /**
     * @returns - the data at the top of heap
     */
    extract() {
        if (this.isEmpty())
            return null;
        let top = this.data.shift();
        if (!this.isEmpty()) {
            this.data.unshift(this.data.pop());
            this.bubbleDown(0);
        }
        return top;
    }
    /**
     * @returns - whether the heap is empty
     */
    isEmpty() {
        return this.data.length === 0;
    }
}
//# sourceMappingURL=heap.js.map