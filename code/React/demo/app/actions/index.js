/**
 * 统一管理 actions 的各个分类
 */

// 加载各个 actions 申明
export * from './events';

// 加载 actions 申明触发（包装）函数
export * from './triggers';

// 加载用于执行 fetch 操作的 action 中间件
export * from './fetch';