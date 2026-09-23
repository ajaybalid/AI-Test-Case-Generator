/* =========================================
   GLOBAL DATA
========================================= */

let generatedTestCases = [];


/* =========================================
   SECURITY
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =========================================
   CREATE STEP LIST
========================================= */

function createStepsHTML(steps) {

    let html = "";

    for (let i = 0; i < steps.length; i++) {

        html += `
            <li>
                ${escapeHTML(steps[i])}
            </li>
        `;

    }

    return html;

}


/* =========================================
   ELEMENTS
========================================= */

const button =
    document.getElementById("generateBtn");

const requirementInput =
    document.getElementById("requirement");

const output =
    document.getElementById("output");

const characterCount =
    document.getElementById("characterCount");

const testType =
    document.getElementById("testType");

const testCaseCount =
    document.getElementById("testCaseCount");


/* =========================================
   CHARACTER COUNTER
========================================= */

requirementInput.addEventListener(
    "input",
    function () {

        const length =
            requirementInput.value.length;

        characterCount.textContent =
            `${length} character${length === 1 ? "" : "s"}`;

    }
);


/* =========================================
   CREATE SUMMARY TABLE
========================================= */

function createSummaryTable(testCases) {

    let rows = "";

    for (let i = 0; i < testCases.length; i++) {

        const testCase =
            testCases[i];

        rows += `

            <tr>

                <td>
                    ${escapeHTML(testCase.id)}
                </td>

                <td>
                    ${escapeHTML(testCase.scenario)}
                </td>

                <td>

                    <span class="type-badge">
                        ${escapeHTML(testCase.testType)}
                    </span>

                </td>

                <td>

                    <span class="priority-badge priority-${testCase.priority.toLowerCase()}">
                        ${escapeHTML(testCase.priority)}
                    </span>

                </td>

                <td>

                    <span class="status-badge status-not-executed">
                        ${escapeHTML(testCase.status)}
                    </span>

                </td>

            </tr>

        `;

    }

    return rows;

}


/* =========================================
   CREATE DETAILED TEST CASES
========================================= */

function createDetailedTestCases(testCases) {

    let html = "";

    for (let i = 0; i < testCases.length; i++) {

        const testCase =
            testCases[i];

        html += `

            <details class="test-case-detail">

                <summary>

                    <div class="detail-summary">

                        <span class="detail-id">
                            ${escapeHTML(testCase.id)}
                        </span>

                        <span class="detail-title">
                            ${escapeHTML(testCase.scenario)}
                        </span>

                        <span class="type-badge">
                            ${escapeHTML(testCase.testType)}
                        </span>

                    </div>

                </summary>


                <div class="detail-content">


                    <div class="detail-grid">


                        <div class="detail-field">

                            <span class="detail-label">
                                Objective
                            </span>

                            <p>
                                ${escapeHTML(testCase.objective)}
                            </p>

                        </div>


                        <div class="detail-field">

                            <span class="detail-label">
                                Priority
                            </span>

                            <p>

                                <span class="priority-badge priority-${testCase.priority.toLowerCase()}">
                                    ${escapeHTML(testCase.priority)}
                                </span>

                            </p>

                        </div>


                        <div class="detail-field">

                            <span class="detail-label">
                                Preconditions
                            </span>

                            <p>
                                ${escapeHTML(testCase.preconditions)}
                            </p>

                        </div>


                        <div class="detail-field">

                            <span class="detail-label">
                                Test Data
                            </span>

                            <p>
                                ${escapeHTML(testCase.testData)}
                            </p>

                        </div>


                    </div>


                    <div class="detail-field">

                        <span class="detail-label">
                            Test Steps
                        </span>

                        <ol class="test-steps">

                            ${createStepsHTML(testCase.steps)}

                        </ol>

                    </div>


                    <div class="detail-field">

                        <span class="detail-label">
                            Expected Result
                        </span>

                        <p>
                            ${escapeHTML(testCase.expectedResult)}
                        </p>

                    </div>


                    <div class="detail-field">

                        <span class="detail-label">
                            Postconditions
                        </span>

                        <p>
                            ${escapeHTML(testCase.postconditions)}
                        </p>

                    </div>


                    <div class="execution-section">


                        <div class="execution-field">

                            <label>
                                Actual Result
                            </label>

                            <textarea
                                class="actual-result-input"
                                data-index="${i}"
                                rows="4"
                            >${escapeHTML(testCase.actualResult)}</textarea>

                        </div>


                        <div class="execution-field">

                            <label>
                                Status
                            </label>

                            <select
                                class="status-input"
                                data-index="${i}"
                            >

                                <option value="Not Executed"
                                    ${testCase.status === "Not Executed" ? "selected" : ""}>
                                    Not Executed
                                </option>

                                <option value="Passed"
                                    ${testCase.status === "Passed" ? "selected" : ""}>
                                    Passed
                                </option>

                                <option value="Failed"
                                    ${testCase.status === "Failed" ? "selected" : ""}>
                                    Failed
                                </option>

                                <option value="Blocked"
                                    ${testCase.status === "Blocked" ? "selected" : ""}>
                                    Blocked
                                </option>

                            </select>

                        </div>


                    </div>


                </div>

            </details>

        `;

    }

    return html;

}


/* =========================================
   BUILD CLIPBOARD TABLE
========================================= */

function createClipboardHTML(testCases) {

    let rows = "";

    for (let i = 0; i < testCases.length; i++) {

        const testCase =
            testCases[i];

        const steps =
            testCase.steps
                .map(
                    (step, index) =>
                        `${index + 1}. ${escapeHTML(step)}`
                )
                .join("<br>");

        rows += `

            <tr>

                <td>${escapeHTML(testCase.id)}</td>

                <td>${escapeHTML(testCase.objective)}</td>

                <td>${escapeHTML(testCase.scenario)}</td>

                <td>${escapeHTML(testCase.testType)}</td>

                <td>${escapeHTML(testCase.preconditions)}</td>

                <td>${escapeHTML(testCase.testData)}</td>

                <td>${steps}</td>

                <td>${escapeHTML(testCase.expectedResult)}</td>

                <td>${escapeHTML(testCase.postconditions)}</td>

                <td>${escapeHTML(testCase.priority)}</td>

                <td>${escapeHTML(testCase.actualResult)}</td>

                <td>${escapeHTML(testCase.status)}</td>

            </tr>

        `;

    }


    return `

        <table border="1">

            <thead>

                <tr>

                    <th>Test Case ID</th>
                    <th>Objective</th>
                    <th>Scenario</th>
                    <th>Test Type</th>
                    <th>Preconditions</th>
                    <th>Test Data</th>
                    <th>Steps</th>
                    <th>Expected Result</th>
                    <th>Postconditions</th>
                    <th>Priority</th>
                    <th>Actual Result</th>
                    <th>Status</th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


/* =========================================
   CREATE TAB-SEPARATED TABLE
========================================= */

function createClipboardText(testCases) {

    const header = [

        "Test Case ID",
        "Objective",
        "Scenario",
        "Test Type",
        "Preconditions",
        "Test Data",
        "Steps",
        "Expected Result",
        "Postconditions",
        "Priority",
        "Actual Result",
        "Status"

    ].join("\t");


    const rows =
        testCases.map(function (testCase) {

            return [

                testCase.id,

                testCase.objective,

                testCase.scenario,

                testCase.testType,

                testCase.preconditions,

                testCase.testData,

                testCase.steps
                    .map(
                        (step, index) =>
                            `${index + 1}. ${step}`
                    )
                    .join(" | "),

                testCase.expectedResult,

                testCase.postconditions,

                testCase.priority,

                testCase.actualResult,

                testCase.status

            ].join("\t");

        });


    return [
        header,
        ...rows
    ].join("\n");

}


/* =========================================
   COPY TABLE
========================================= */

async function copyTable() {

    try {

        const html =
            createClipboardHTML(
                generatedTestCases
            );

        const text =
            createClipboardText(
                generatedTestCases
            );


        if (
            navigator.clipboard &&
            window.ClipboardItem
        ) {

            const clipboardItem =
                new ClipboardItem({

                    "text/html":
                        new Blob(
                            [html],
                            {
                                type: "text/html"
                            }
                        ),

                    "text/plain":
                        new Blob(
                            [text],
                            {
                                type: "text/plain"
                            }
                        )

                });


            await navigator.clipboard.write(
                [clipboardItem]
            );

        }

        else {

            await navigator.clipboard.writeText(
                text
            );

        }


        const copyButton =
            document.getElementById(
                "copyTableBtn"
            );

        copyButton.innerHTML =
            "✓ Copied!";


        setTimeout(function () {

            copyButton.innerHTML =
                "📋 Copy Table";

        }, 2000);


    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to copy the table. Please try again."
        );

    }

}


/* =========================================
   CSV ESCAPE
========================================= */

function escapeCSV(value) {

    const text =
        String(value ?? "");

    return `"${text.replace(/"/g, '""')}"`;

}


/* =========================================
   EXPORT CSV
========================================= */

function exportCSV() {

    const headers = [

        "Test Case ID",
        "Objective",
        "Scenario",
        "Test Type",
        "Preconditions",
        "Test Data",
        "Steps",
        "Expected Result",
        "Postconditions",
        "Priority",
        "Actual Result",
        "Status"

    ];


    const rows = [

        headers.map(escapeCSV).join(",")

    ];


    generatedTestCases.forEach(
        function (testCase) {

            rows.push(

                [

                    testCase.id,

                    testCase.objective,

                    testCase.scenario,

                    testCase.testType,

                    testCase.preconditions,

                    testCase.testData,

                    testCase.steps
                        .map(
                            (step, index) =>
                                `${index + 1}. ${step}`
                        )
                        .join(" | "),

                    testCase.expectedResult,

                    testCase.postconditions,

                    testCase.priority,

                    testCase.actualResult,

                    testCase.status

                ]
                    .map(escapeCSV)
                    .join(",")

            );

        }
    );


    const csv =
        rows.join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "ai-test-cases.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


/* =========================================
   UPDATE EXECUTION DATA
========================================= */

function updateExecutionData() {

    const actualResultInputs =
        document.querySelectorAll(
            ".actual-result-input"
        );


    actualResultInputs.forEach(
        function (input) {

            input.addEventListener(
                "input",
                function () {

                    const index =
                        Number(input.dataset.index);

                    generatedTestCases[index]
                        .actualResult =
                        input.value;

                }
            );

        }
    );


    const statusInputs =
        document.querySelectorAll(
            ".status-input"
        );


    statusInputs.forEach(
        function (select) {

            select.addEventListener(
                "change",
                function () {

                    const index =
                        Number(select.dataset.index);

                    generatedTestCases[index]
                        .status =
                        select.value;


                    updateSummaryStatus(
                        index,
                        select.value
                    );

                }
            );

        }
    );

}


/* =========================================
   UPDATE SUMMARY STATUS
========================================= */

function updateSummaryStatus(
    index,
    status
) {

    const rows =
        document.querySelectorAll(
            ".summary-table tbody tr"
        );


    if (!rows[index]) {
        return;
    }


    const statusCell =
        rows[index].querySelector(
            ".status-badge"
        );


    if (!statusCell) {
        return;
    }


    statusCell.textContent =
        status;


    statusCell.className =
        "status-badge";


    if (status === "Passed") {

        statusCell.classList.add(
            "status-passed"
        );

    }

    else if (status === "Failed") {

        statusCell.classList.add(
            "status-failed"
        );

    }

    else if (status === "Blocked") {

        statusCell.classList.add(
            "status-blocked"
        );

    }

    else {

        statusCell.classList.add(
            "status-not-executed"
        );

    }

}


/* =========================================
   GENERATE BUTTON
========================================= */

button.addEventListener(
    "click",
    async function () {

        const requirement =
            requirementInput.value.trim();

        const selectedTestType =
            testType.value;

        const selectedTestCaseCount =
            testCaseCount.value;


        /* =========================================
           EMPTY REQUIREMENT
        ========================================= */

        if (!requirement) {

            output.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        !
                    </div>

                    <h3>
                        Requirement needed
                    </h3>

                    <p>
                        Please enter a software requirement
                        before generating test cases.
                    </p>

                </div>

            `;

            requirementInput.focus();

            return;

        }


        /* =========================================
           LOADING
        ========================================= */

        button.disabled = true;

        button.innerHTML = `

            <span class="button-icon">
                ✦
            </span>

            Generating Test Cases...

        `;


        output.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon loading-icon">
                    ✦
                </div>

                <h3>
                    AI is analyzing your requirement
                </h3>

                <p>
                    Generating structured test scenarios,
                    test data, steps, expected results,
                    and priorities...
                </p>

            </div>

        `;


        try {

            /* =========================================
               SEND REQUEST
            ========================================= */

            const response =
                await fetch(
                    "/generate",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            requirement:
                                requirement,

                            testType:
                                selectedTestType,

                            testCaseCount:
                                selectedTestCaseCount

                        })

                    }
                );


            if (!response.ok) {

                const errorData =
                    await response.json()
                        .catch(
                            function () {
                                return {};
                            }
                        );


                throw new Error(
                    errorData.error ||
                    "The server could not generate test cases."
                );

            }


            const data =
                await response.json();


            /* =========================================
               PARSE AI RESPONSE
            ========================================= */

            const testCases =
                JSON.parse(
                    data.testCases
                );


            /* =========================================
               ADD EXECUTION FIELDS
            ========================================= */

            generatedTestCases =
                testCases.map(
                    function (testCase) {

                        return {

                            ...testCase,

                            actualResult:
                                "Not Executed",

                            status:
                                "Not Executed"

                        };

                    }
                );


            /* =========================================
               CALCULATE METRICS
            ========================================= */

            const totalCases =
                generatedTestCases.length;


            const highPriority =
                generatedTestCases.filter(
                    function (testCase) {

                        return testCase.priority === "High";

                    }
                ).length;


            const notExecuted =
                generatedTestCases.filter(
                    function (testCase) {

                        return testCase.status === "Not Executed";

                    }
                ).length;


            /* =========================================
               BUILD OUTPUT
            ========================================= */

            const rows =
                createSummaryTable(
                    generatedTestCases
                );


            const details =
                createDetailedTestCases(
                    generatedTestCases
                );


            output.innerHTML = `

                <div class="results-header">

                    <div>

                        <p class="section-label">
                            AI GENERATED OUTPUT
                        </p>

                        <h3>
                            ${totalCases}
                            Test Cases Generated
                        </h3>

                    </div>


                    <div class="result-actions">

                        <button
                            id="copyTableBtn"
                            class="secondary-action-btn"
                            type="button"
                        >
                            📋 Copy Table
                        </button>


                        <button
                            id="exportCsvBtn"
                            class="secondary-action-btn"
                            type="button"
                        >
                            ↓ Export CSV
                        </button>

                    </div>

                </div>


                <div class="requirement-display">

                    <strong>
                        Requirement
                    </strong>

                    <p>
                        ${escapeHTML(requirement)}
                    </p>

                </div>


                <div class="metrics-grid">

                    <div class="metric-card">

                        <span class="metric-label">
                            Total Cases
                        </span>

                        <strong>
                            ${totalCases}
                        </strong>

                    </div>


                    <div class="metric-card">

                        <span class="metric-label">
                            High Priority
                        </span>

                        <strong>
                            ${highPriority}
                        </strong>

                    </div>


                    <div class="metric-card">

                        <span class="metric-label">
                            Not Executed
                        </span>

                        <strong>
                            ${notExecuted}
                        </strong>

                    </div>

                </div>


                <div class="table-wrapper">

                    <table class="summary-table">

                        <thead>

                            <tr>

                                <th>
                                    Test Case ID
                                </th>

                                <th>
                                    Scenario
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Priority
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${rows}

                        </tbody>

                    </table>

                </div>


                <div class="details-heading">

                    <p class="section-label">
                        TEST CASE DETAILS
                    </p>

                    <h3>
                        Detailed Test Cases
                    </h3>

                    <p>
                        Expand a test case to view its
                        complete QA information and record
                        execution results.
                    </p>

                </div>


                <div class="test-case-details">

                    ${details}

                </div>

            `;


            /* =========================================
               ACTION BUTTONS
            ========================================= */

            document
                .getElementById("copyTableBtn")
                .addEventListener(
                    "click",
                    copyTable
                );


            document
                .getElementById("exportCsvBtn")
                .addEventListener(
                    "click",
                    exportCSV
                );


            updateExecutionData();


            /* =========================================
               SCROLL TO RESULTS
            ========================================= */

            output.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }


        catch (error) {

            console.error(error);


            output.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        !
                    </div>

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        ${escapeHTML(error.message)}
                    </p>

                </div>

            `;

        }


        finally {

            button.disabled = false;

            button.innerHTML = `

                <span class="button-icon">
                    ✦
                </span>

                Generate Test Cases

            `;

        }

    }
);