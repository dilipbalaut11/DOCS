FSM tree,

1. This is Three level tree.  Each level there are pages and pages are again the tree
2. Only leaf slots of the leaf most pages stores the actual space for per heap page and block number to slot number calculation can be done using
Blockno/LeafSlotPerFSMPage.
3. Intermediate slot of each FSM Tree(FSM page only used for the direction).
-- Although it's not completely BST because the leaf level slot is directly map to the heap block so at leaf we don't have control it can be any byte free but from then onwards each parent will keep the highest value of its slot and so on.  So the value at the root will be highest free space any heap block have in this ism tree(Binary heap)