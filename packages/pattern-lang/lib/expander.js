export class PatternExpander {
    expand(ast) {
        const items = this.expandNode(ast);
        return items;
    }
    expandNode(node) {
        switch (node.type) {
            case 'symbol':
                return this.expandSymbol(node);
            case 'sequence':
                return this.expandSequence(node);
            case 'command':
                return this.expandCommand(node);
            case 'elementCount':
                return this.expandElementCount(node);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }
    expandSymbol(node) {
        const items = [];
        const count = node.count || 1;
        for (let i = 0; i < count; i++) {
            items.push({
                char: node.char,
                rotated: node.rotated
            });
        }
        return items;
    }
    expandSequence(node) {
        const items = [];
        for (const pattern of node.patterns) {
            items.push(...this.expandNode(pattern));
        }
        // Apply sequence count if specified
        if (node.count) {
            const baseItems = [...items];
            items.length = 0;
            for (let i = 0; i < node.count; i++) {
                items.push(...baseItems);
            }
        }
        return items;
    }
    expandCommand(node) {
        switch (node.name) {
            case 'seq':
                return this.expandSeqCommand(node);
            case 'mir':
                return this.expandMirCommand(node);
            case 'space':
                return this.expandSpaceCommand(node);
            default:
                throw new Error(`Unknown command: ${node.name}`);
        }
    }
    expandSeqCommand(node) {
        if (node.args.length < 2) {
            throw new Error('seq command requires at least 2 arguments');
        }
        // Last argument should be a number node
        const lastArg = node.args[node.args.length - 1];
        if (lastArg.type !== 'symbol' || !lastArg.count) {
            throw new Error('seq command requires a count as the last argument');
        }
        const repeatCount = lastArg.count;
        const patterns = node.args.slice(0, -1);
        const items = [];
        for (let i = 0; i < repeatCount; i++) {
            for (const pattern of patterns) {
                items.push(...this.expandNode(pattern));
            }
        }
        return items;
    }
    expandMirCommand(node) {
        if (node.args.length !== 1) {
            throw new Error('mir command requires exactly 1 argument');
        }
        const items = this.expandNode(node.args[0]);
        return items.reverse();
    }
    expandSpaceCommand(node) {
        if (node.args.length < 2) {
            throw new Error('space command requires at least 2 arguments');
        }
        // Last argument should be a number node
        const lastArg = node.args[node.args.length - 1];
        if (lastArg.type !== 'symbol' || !lastArg.count) {
            throw new Error('space command requires a count as the last argument');
        }
        const spaceCount = lastArg.count;
        const patterns = node.args.slice(0, -1);
        const items = [];
        for (let i = 0; i < patterns.length; i++) {
            items.push(...this.expandNode(patterns[i]));
            // Add spaces between patterns (not after the last one)
            if (i < patterns.length - 1) {
                for (let j = 0; j < spaceCount; j++) {
                    items.push({ char: 'x', rotated: false });
                }
            }
        }
        return items;
    }
    expandElementCount(node) {
        const items = this.expandNode(node.pattern);
        // Repeat pattern to fill the count
        const result = [];
        const patternLength = items.length;
        if (patternLength === 0) {
            return result;
        }
        const fullRepeats = Math.floor(node.count / patternLength);
        const remainder = node.count % patternLength;
        // Add full repeats
        for (let i = 0; i < fullRepeats; i++) {
            result.push(...items);
        }
        // Add remainder
        for (let i = 0; i < remainder; i++) {
            result.push(items[i]);
        }
        return result;
    }
}
