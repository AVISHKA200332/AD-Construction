const Finance = require("../Model/FinanceModel");
const Project = require("../Model/ProjectModel");

const STAGES = {
  deposit: "deposit",
  balance: "balance"
};

const buildStageSummary = (record, expectedAmount) => {
  if (!record) {
    return {
      expectedAmount,
      paidAmount: 0,
      status: "Pending",
      paidAt: null,
      financeId: null,
      bankSlipPath: null
    };
  }

  return {
    expectedAmount,
    paidAmount: record.paidAmount ?? record.amount ?? 0,
    status: record.status,
    paidAt: record.paidAt || record.date || null,
    financeId: record._id,
    bankSlipPath: record.bankSlipPath || null
  };
};

const getInstallmentTargets = (budget = 0) => {
  const normalizedBudget = Number(budget) || 0;
  const deposit = Math.round(normalizedBudget * 0.6);
  const balance = normalizedBudget - deposit;
  return { deposit, balance };
};

exports.listProjects = async (req, res) => {
  try {
    const projects = await Project.find().select("name budget client status");
    const projectIds = projects.map((project) => project._id);

    const financeRecords = await Finance.find({ project: { $in: projectIds } });
    const groupedFinance = financeRecords.reduce((acc, record) => {
      const projectKey = String(record.project);
      if (!acc.has(projectKey)) {
        acc.set(projectKey, []);
      }
      acc.get(projectKey).push(record);
      return acc;
    }, new Map());

    const payload = projects.map((project) => {
      const { deposit, balance } = getInstallmentTargets(project.budget);
      const records = groupedFinance.get(String(project._id)) || [];
      const depositRecord = records.find((record) => record.stage === STAGES.deposit);
      const balanceRecord = records.find((record) => record.stage === STAGES.balance);

      return {
        project: {
          _id: project._id,
          name: project.name,
          budget: project.budget,
          client: project.client,
          status: project.status
        },
        payments: {
          deposit: buildStageSummary(depositRecord, deposit),
          balance: buildStageSummary(balanceRecord, balance)
        }
      };
    });

    return res.status(200).json({ projects: payload });
  } catch (error) {
    console.error("Failed to list client finance projects", error);
    return res.status(500).json({ message: "Failed to retrieve project payment information" });
  }
};

exports.submitPayment = async (req, res) => {
  try {
    const { projectId, stage, description } = req.body;
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    if (![STAGES.deposit, STAGES.balance].includes(stage)) {
      return res.status(400).json({ message: "stage must be either 'deposit' or 'balance'" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { deposit, balance } = getInstallmentTargets(project.budget);

    const existingDeposit = await Finance.findOne({ project: projectId, stage: STAGES.deposit });
    const existingBalance = await Finance.findOne({ project: projectId, stage: STAGES.balance });

    if (stage === STAGES.deposit && existingDeposit && existingDeposit.status === "Paid") {
      return res.status(400).json({ message: "Deposit payment has already been submitted" });
    }

    if (stage === STAGES.balance) {
      if (!existingDeposit || existingDeposit.status !== "Paid") {
        return res.status(400).json({ message: "Deposit must be paid before submitting the balance" });
      }

      if (existingBalance && existingBalance.status === "Paid") {
        return res.status(400).json({ message: "Balance payment has already been submitted" });
      }
    }

    const expectedAmount = stage === STAGES.deposit ? deposit : balance;
    const paidAmount = expectedAmount;
    const now = new Date();
    const bankSlipPath = req.file ? `/uploads/bank-slips/${req.file.filename}` : req.body.bankSlipPath || null;
    const source = req.user?.role === "Client" ? "client" : "admin";

    const basePayload = {
      description: description || `${stage === STAGES.deposit ? "Deposit" : "Balance"} payment for ${project.name}`,
      Project_Name: project.name,
      category: "Income",
      amount: expectedAmount,
      date: now,
      status: "Paid",
      project: project._id,
      bankSlipPath,
      stage,
      expectedAmount,
      paidAmount,
      paidAt: now,
      submittedBy: req.user?._id,
      source
    };

    let financeRecord = stage === STAGES.deposit ? existingDeposit : existingBalance;
    if (financeRecord) {
      Object.assign(financeRecord, basePayload);
    } else {
      financeRecord = new Finance(basePayload);
    }

    await financeRecord.save();

    const updatedSummary = {
      deposit: buildStageSummary(stage === STAGES.deposit ? financeRecord : existingDeposit, deposit),
      balance: buildStageSummary(stage === STAGES.balance ? financeRecord : existingBalance, balance)
    };

    return res.status(201).json({
      finance: financeRecord,
      project: {
        _id: project._id,
        name: project.name,
        budget: project.budget
      },
      payments: updatedSummary
    });
  } catch (error) {
    console.error("Failed to submit client payment", error);
    return res.status(500).json({ message: "Failed to submit payment", error: error.message });
  }
};
