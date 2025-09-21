// 完整的工具测试脚本
import { lsExecutor } from "./packages/core/src/tools/ls-tool.ts";
import { readExecutor } from "./packages/core/src/tools/read-tool.ts";
import { thinkingExecutor } from "./packages/core/src/tools/thinking-tool.ts";
import { translateExecutor } from "./packages/core/src/tools/translate-tool.ts";

async function testAllTools() {
    console.log("🚀 开始测试所有工具...\n");

    await testLsTool();
    await testReadTool();
    await testThinkingTool();
    await testTranslateTool();
}

async function testLsTool() {
    console.log("=== 测试 ls-tool ===");
    try {
        const lsResult = await lsExecutor({}, {});
        console.log("✅ ls-tool 成功:");
        console.log(`找到 ${lsResult.total} 个文件:`);
        lsResult.files.forEach(file => {
            console.log(`  - ${file.name} (${file.extension}, ${file.size} bytes)`);
        });
    } catch (error) {
        console.log("❌ ls-tool 失败:", error);
    }
    console.log();
}

async function testReadTool() {
    console.log("=== 测试 read-tool ===");
    try {
        const readResult = await readExecutor({ file_path: "./README.md" }, {});
        if (readResult.status === "success") {
            console.log("✅ read-tool 成功:");
            console.log(`文件大小: ${readResult.metadata?.size} bytes`);
            console.log("文件内容前100字符:");
            console.log(readResult.content.slice(0, 100) + "...");
        } else {
            console.log("❌ read-tool 失败:", readResult.error_message);
        }
    } catch (error) {
        console.log("❌ read-tool 异常:", error);
    }
    console.log();
}

async function testThinkingTool() {
    console.log("=== 测试 thinking-tool ===");

    const testContent = `This is a sample text file for translation testing. It contains multiple sentences and paragraphs.

The purpose of this file is to test our translation agent. We will use this to verify that our tools can properly read and process text files.

This content should be split into segments for translation, with each segment being no more than 300 characters as specified in our requirements.`;

    // 测试文本分段
    try {
        console.log("📝 测试文本分段功能:");
        const segmentResult = await thinkingExecutor({
            action: "segment_text",
            content: testContent
        }, {});

        console.log("✅ 分段成功:");
        console.log(`  ${segmentResult.result}`);
        if (segmentResult.segments) {
            segmentResult.segments.forEach(segment => {
                console.log(`  段落 ${segment.index}: ${segment.length} 字符`);
                console.log(`    "${segment.text.slice(0, 50)}..."`);
            });
        }
    } catch (error) {
        console.log("❌ 文本分段失败:", error);
    }

    // 测试内容分析
    try {
        console.log("\n🔍 测试内容分析功能:");
        const analyzeResult = await thinkingExecutor({
            action: "analyze_content",
            content: testContent
        }, {});

        console.log("✅ 分析成功:");
        console.log(`  ${analyzeResult.result}`);
        console.log(`  检测语言: ${analyzeResult.metadata?.language_detected}`);
    } catch (error) {
        console.log("❌ 内容分析失败:", error);
    }

    console.log();
}

async function testTranslateTool() {
    console.log("=== 测试 translate-tool ===");

    const testText = "Hello world! This is a test sentence for translation.";

    // 测试无copilotHandler的情况（自动批准）
    try {
        console.log("🤖 测试自动翻译功能（无用户界面）:");
        const translateResult = await translateExecutor({
            file_id: "test_001",
            src_string: testText,
            target_language: "Chinese"
        }, {}); // 没有copilotHandler

        console.log("✅ 自动翻译成功:");
        console.log(`  原文: ${testText}`);
        console.log(`  译文: ${translateResult.translated_string}`);
        console.log(`  状态: ${translateResult.status}`);
        console.log(`  说明: ${translateResult.reason}`);
    } catch (error) {
        console.log("❌ 自动翻译失败:", error);
        console.log("这可能是因为没有设置API密钥，属于正常情况");
    }

    // 测试带mockCopilotHandler的情况
    try {
        console.log("\n👤 测试用户反馈功能（模拟用户）:");

        const mockCopilotHandler = async (request: any) => {
            console.log(`    收到翻译请求: "${request.src_string}"`);
            console.log(`    AI译文: "${request.translate_string}"`);
            return {
                status: "refined" as const,
                translated_string: "你好世界！这是一个用于翻译的测试句子。",
                reason: "用户修正了翻译"
            };
        };

        const translateResult = await translateExecutor({
            file_id: "test_002",
            src_string: testText,
            translate_string: "你好世界！这是翻译测试句子。", // 提供预设译文
            target_language: "Chinese"
        }, { copilotHandler: mockCopilotHandler });

        console.log("✅ 用户反馈处理成功:");
        console.log(`  最终译文: ${translateResult.translated_string}`);
        console.log(`  状态: ${translateResult.status}`);
        console.log(`  说明: ${translateResult.reason}`);
    } catch (error) {
        console.log("❌ 用户反馈处理失败:", error);
    }

    console.log();
}

// 运行测试
testAllTools();