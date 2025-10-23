import type { PatternNode, ParseResult } from './types';
import type { GrammarItem } from '@wheelgen/types';

export class PatternExpander {
  expand(ast: PatternNode): GrammarItem[] {
    const items = this.expandNode(ast);
    return items;
  }

  private expandNode(node: PatternNode): GrammarItem[] {
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
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  private expandSymbol(node: PatternNode & { type: 'symbol' }): GrammarItem[] {
    const items: GrammarItem[] = [];
    const count = node.count || 1;
    
    for (let i = 0; i < count; i++) {
      items.push({
        char: node.char as GrammarItem['char'],
        rotated: node.rotated
      });
    }
    
    return items;
  }

  private expandSequence(node: PatternNode & { type: 'sequence' }): GrammarItem[] {
    const items: GrammarItem[] = [];
    
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

  private expandCommand(node: PatternNode & { type: 'command' }): GrammarItem[] {
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

  private expandSeqCommand(node: PatternNode & { type: 'command' }): GrammarItem[] {
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
    
    const items: GrammarItem[] = [];
    
    for (let i = 0; i < repeatCount; i++) {
      for (const pattern of patterns) {
        items.push(...this.expandNode(pattern));
      }
    }
    
    return items;
  }

  private expandMirCommand(node: PatternNode & { type: 'command' }): GrammarItem[] {
    if (node.args.length !== 1) {
      throw new Error('mir command requires exactly 1 argument');
    }
    
    const items = this.expandNode(node.args[0]);
    return items.reverse();
  }

  private expandSpaceCommand(node: PatternNode & { type: 'command' }): GrammarItem[] {
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
    
    const items: GrammarItem[] = [];
    
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

  private expandElementCount(node: PatternNode & { type: 'elementCount' }): GrammarItem[] {
    const items = this.expandNode(node.pattern);
    
    // Repeat pattern to fill the count
    const result: GrammarItem[] = [];
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
