require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateWithRetry(generateRequest, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await generateRequest();
        } catch (error) {
            const status = error?.status || error?.error?.code;

            if (status !== 503 || attempt === maxRetries) {
                throw error;
            }

            const delay = 2000 * Math.pow(2, attempt);

            console.log(
                `Gemini temporarily unavailable. Retrying in ${delay / 1000} seconds...`
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function generateWithCountRetry(generateRequest, requestedCount, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await generateWithRetry(generateRequest);

        const testCases = JSON.parse(response.text);

        if (!Array.isArray(testCases)) {
            throw new Error("AI returned an invalid test case format.");
        }

        // AI decides → no exact count validation needed
        if (requestedCount === null) {
            return { response, testCases };
        }

        // Correct number → we're done
        if (testCases.length === requestedCount) {
            return { response, testCases };
        }

        // Wrong number, but retries are still available
        if (attempt < maxRetries) {
            console.warn(
                `Requested ${requestedCount} cases but AI returned ${testCases.length}. Retrying generation...`
            );
            continue;
        }

        // Still wrong after all retries
        throw new Error(
            `AI returned ${testCases.length} test cases instead of ${requestedCount}.`
        );
    }
}

/* =========================================
   TEST CASE SCHEMA
========================================= */

const testCaseSchema = {

    type: "array",

    items: {

        type: "object",

        properties: {

            id: {
                type: "string"
            },

            objective: {
                type: "string"
            },

            scenario: {
                type: "string"
            },

            testType: {
                type: "string",
                enum: [
                    "Functional",
                    "Negative",
                    "Edge Case",
                    "Regression"
                ]
            },

            preconditions: {
                type: "string"
            },

            testData: {
                type: "string"
            },

            steps: {

                type: "array",

                items: {
                    type: "string"
                }

            },

            expectedResult: {
                type: "string"
            },

            postconditions: {
                type: "string"
            },

            priority: {
                type: "string",
                enum: [
                    "High",
                    "Medium",
                    "Low"
                ]
            }

        },

        required: [

            "id",
            "objective",
            "scenario",
            "testType",
            "preconditions",
            "testData",
            "steps",
            "expectedResult",
            "postconditions",
            "priority"

        ],

        additionalProperties: false

    }

};


/* =========================================
   EXPRESS APP
========================================= */

const app = express();

app.use(express.json());

app.use(express.static(__dirname));


/* =========================================
   TEST ROUTE
========================================= */

app.get("/test", function (req, res) {

    res.send("Backend is working!");

});


/* =========================================
   GENERATE TEST CASES
========================================= */

app.post("/generate", async function (req, res) {

    try {

        const requirement =
            req.body.requirement;

        const testType =
            req.body.testType || "All Types";

        const testCaseCount =
            req.body.testCaseCount || "AI decides";


        /* =========================================
           VALIDATE REQUIREMENT
        ========================================= */

        if (!requirement || !requirement.trim()) {

            return res.status(400).json({

                error: "Software requirement is required."

            });

        }


        /* =========================================
           TEST CASE COUNT INSTRUCTION
        ========================================= */

        let countInstruction = "";

        if (testCaseCount === "AI decides") {

            countInstruction = `

Determine an appropriate number of test cases based
on the complexity of the requirement.

Use meaningful coverage rather than generating unnecessary
duplicate cases.

For simple requirements, generate approximately 5-8 cases.

For moderately complex requirements, generate approximately
8-12 cases.

For complex requirements, generate approximately 12-15 cases.

Do not generate more than 15 cases when AI decides the count.

`;

        } else {

            const requestedCount =
                Number(testCaseCount);

            countInstruction = `

Generate EXACTLY ${requestedCount} test cases.

The final response must contain exactly ${requestedCount}
distinct test cases.

Do not generate fewer.

Do not generate more.

Avoid duplicate scenarios.

`;

        }


        /* =========================================
           TEST TYPE INSTRUCTION
        ========================================= */

        let testTypeInstruction = "";

        if (testType === "Functional") {

            testTypeInstruction = `

Generate Functional test cases only.

Focus on:

- normal valid user flows
- successful business behavior
- valid inputs
- expected functionality

Do not generate negative or edge-case scenarios.

`;

        }

        else if (testType === "Negative") {

            testTypeInstruction = `

Generate Negative test cases only.

Focus on:

- invalid inputs
- missing inputs
- incorrect values
- validation failures
- unauthorized actions
- error handling
- invalid combinations

Do not generate ordinary successful happy-path scenarios.

`;

        }

        else if (testType === "Edge Case") {

            testTypeInstruction = `

Generate Edge Case test cases only.

Focus on:

- minimum values
- maximum values
- boundary conditions
- unusually long inputs
- unusually short inputs
- empty or whitespace values
- special characters
- unusual but valid inputs
- limits
- exceptional combinations

Do not generate ordinary happy-path scenarios.

`;

        }

        else if (testType === "Regression") {

            testTypeInstruction = `

Generate Regression test cases only.

Focus on important functionality that should continue
working after a software change.

Include important positive and negative scenarios that
would be valuable to execute again after modifications.

`;

        }

        else {

            testTypeInstruction = `

Generate a balanced combination of:

- Functional
- Negative
- Edge Case
- Regression

Assign the appropriate test type to every individual
test case.

The selected type for each case must accurately describe
the scenario.

`;

        }


        /* =========================================
           AI REQUEST
        ========================================= */

        const requestedCount =
            testCaseCount === "AI decides" ? null : Number(testCaseCount);

        const { response, testCases } = await generateWithCountRetry(
            () =>
            client.models.generateContent({
                model: "gemini-3.5-flash-lite",

                contents: `

Software Requirement:

${requirement}


Requested Test Type:

${testType}


Requested Number of Test Cases:

${testCaseCount}


${countInstruction}


${testTypeInstruction}


TEST CASE QUALITY REQUIREMENTS

Generate professional software QA test cases.

Every test case should contain:

1. Test Case ID
2. Objective
3. Test Scenario
4. Test Type
5. Preconditions
6. Test Data
7. Multiple clear test steps
8. Expected Result
9. Postconditions
10. Priority


STEPS

Use approximately 3-6 clear steps when appropriate.

Steps should describe what the tester actually does.

Do not combine many unrelated actions into one step.


TEST DATA

Clearly describe the values or conditions required
to execute the test.

If a test does not require specific data, state:

"No specific test data required."


PRECONDITIONS

Describe what must already be true before execution.


EXPECTED RESULT

Describe the observable result that should occur.


POSTCONDITIONS

Describe the state of the application after the test.


PRIORITY

Use only:

High
Medium
Low


QUALITY RULES

- Do not create duplicate test cases.
- Do not invent unrelated functionality.
- Stay strictly within the provided requirement.
- Cover important behavior rather than producing repetitive cases.
- Use realistic QA terminology.
- Make every test case independently understandable.

IMPORTANT:

Actual Result and execution Status must NOT be generated by AI.

Those fields will be added by the application after
test-case generation.

`,

                config: {

                    systemInstruction:
                        "You are a professional software QA test case generation assistant. Generate structured, realistic and executable test cases from software requirements.",

                    responseMimeType:
                        "application/json",

                    responseSchema:
                        testCaseSchema

                }

                       }),
        requestedCount
        );


        console.log("AI response received.");


        /* =========================================
           RETURN RESPONSE
        ========================================= */

        res.json({

            message:
                "AI response received",

            testCases:
                JSON.stringify(testCases)

        });


    }

    catch (error) {

        console.error(
            "Generation error:",
            error
        );


        res.status(500).json({

            error:
                "Unable to generate test cases. Please check the server and try again."

        });

    }

});


/* =========================================
   START SERVER
========================================= */

app.listen(3000, function () {

    console.log(
        "Server is running on http://localhost:3000"
    );

});