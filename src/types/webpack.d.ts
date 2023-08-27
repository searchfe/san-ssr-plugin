declare module 'webpack/lib/rules/UseEffectRulePlugin';
declare module 'webpack/lib/rules/BasicEffectRulePlugin';
declare module 'webpack/lib/rules/BasicMatcherRulePlugin';
declare module 'webpack/lib/rules/RuleSetCompiler' {
    import type {RuleSetRule} from 'webpack';
    interface BasicEffect {
        type: 'type' | 'sideEffects' | 'parser' | 'resolve';
        value: any;
    }

    interface UseEffect {
        type: 'use';
        value: {
            loader: string;
            options: any;
            ident: string;
        };
    }

    type Effect = BasicEffect | UseEffect;
    interface RuleSet {
        references: Map<string, any>;
        exec(data: object): Effect[];
    }
    interface CompiledRule {
        conditions: RuleCondition[];
        effects: Effect[];
        rules: CompiledRule[];
        oneOf: CompiledRule[];
    }
    export default class RuleSetCompiler {
        constructor(plugins: any);
        compile(rawRules: RuleSetRule[]): RuleSet;
        compileRule(
            path: string,
            rawRule: RuleSetRule,
            refs: Map<string, any>
        ): CompiledRule;
    };
};
