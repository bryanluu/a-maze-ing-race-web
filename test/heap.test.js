import { expect, test } from '@jest/globals';
import Heap from "../src/heap";
const maxHeapComparator = (x, y) => x - y;
const minHeapComparator = (x, y) => y - x;
test("isEmpty works correctly", () => {
    let h = new Heap(maxHeapComparator);
    expect(h.isEmpty()).toBe(true);
    h.insert(1);
    expect(h.isEmpty()).toBe(false);
    h.extract();
    expect(h.isEmpty()).toBe(true);
});
test("insert works correctly for max-heap", () => {
    let h = new Heap(maxHeapComparator);
    // case 0: adding root X
    h.insert(2);
    expect(h.data).toEqual([2]);
    // case 1: adding L R to root X, where L < R < X
    h.insert(0);
    expect(h.data).toEqual([2, 0]);
    h.insert(1);
    expect(h.data).toEqual([2, 0, 1]);
    // case 2: adding A to [X L R], where L < X < R < A
    h.insert(3);
    expect(h.data).toEqual([3, 2, 1, 0]);
    h.insert(4);
    expect(h.data).toEqual([4, 3, 1, 0, 2]);
    // case 3: wikipedia tree
    let wiki = [11, 5, 8, 3, 4];
    h.data = wiki;
    h.insert(15);
    expect(h.data).toEqual([15, 5, 11, 3, 4, 8]);
});
test("extract works correctly for max-heap", () => {
    let h = new Heap(maxHeapComparator);
    // extracting empty
    let actual = h.extract();
    expect(actual).toBe(null);
    // extracting single root
    h.data = [1];
    actual = h.extract();
    expect(actual).toBe(1);
    expect(h.data).toEqual([]);
    expect(h.isEmpty()).toBe(true);
    // extracting from wiki tree
    let wiki = [11, 5, 8, 3, 4];
    h.data = wiki;
    actual = h.extract();
    expect(actual).toBe(11);
    expect(h.data).toEqual([8, 5, 4, 3]);
});
//# sourceMappingURL=heap.test.js.map