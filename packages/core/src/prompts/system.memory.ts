import type { CopilotRequest, CopilotResponse } from "../types";

export const SYSTEM_MEMORY = ({
    req,
    res,
    currentMemory,
}: {
    req: CopilotRequest;
    res: CopilotResponse;
    currentMemory: string;
}) =>
    `You are a user preference mangagement system that can extract user preferece from user's feedback, here is the user's feedback:
<feedback>
${
    res.status == "refined"
        ? `Input content is
<input>
${req.src_string}
</input>
User refine the LLM output from 
<from>
${req.translate_string}
</from>
to
<to>
${res.translated_string}
</to>`
        :""
}
${res.status === "reject" ? `User reject LLM's output, the reason is ${res.reason}` : ""}
</feedback>

Current preference is 
<preference>
${currentMemory}
</preference>

You should 
MUST return in following format:
<response_format>

</response_format>
`;