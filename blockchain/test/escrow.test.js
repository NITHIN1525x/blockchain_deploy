const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelanceEscrow", function () {
    let escrow;
    let admin, client, freelancer;
    const PLATFORM_FEE = 2;

    beforeEach(async function () {
        [admin, client, freelancer] = await ethers.getSigners();

        const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
        escrow = await FreelanceEscrow.deploy(PLATFORM_FEE);
        await escrow.waitForDeployment();
    });

    describe("Deployment", function () {
        it("sets admin correctly", async function () {
            expect(await escrow.admin()).to.equal(admin.address);
        });

        it("sets platform fee correctly", async function () {
            expect(await escrow.platformFeePercent()).to.equal(PLATFORM_FEE);
        });
    });

    describe("Create Project", function () {
        it("creates project successfully", async function () {
            await escrow.connect(client).createProject(freelancer.address);
            expect(await escrow.projectCounter()).to.equal(1);
        });

        it("fails if client equals freelancer", async function () {
            await expect(
                escrow.connect(client).createProject(client.address)
            ).to.be.revertedWith("Client and freelancer must be different.");
        });
    });

    describe("Lock Payment", function () {
        beforeEach(async function () {
            await escrow.connect(client).createProject(freelancer.address);
        });

        it("locks ETH into escrow", async function () {
            const amount = ethers.parseEther("1.0");
            await escrow.connect(client).lockPayment(1, { value: amount });

            const project = await escrow.getProject(1);
            expect(project.amount).to.equal(amount);
            expect(project.paymentStatus).to.equal(1);
        });
    });

    describe("Submit Work", function () {
        let projectAmount;

        beforeEach(async function () {
            projectAmount = ethers.parseEther("1.0");
            await escrow.connect(client).createProject(freelancer.address);
            await escrow.connect(client).lockPayment(1, { value: projectAmount });
        });

        it("auto-releases payment when the freelancer submits work", async function () {
            const beforeBalance = await ethers.provider.getBalance(freelancer.address);

            const tx = await escrow.connect(freelancer).submitWork(1);
            const receipt = await tx.wait();

            const afterBalance = await ethers.provider.getBalance(freelancer.address);
            const fee = (projectAmount * BigInt(PLATFORM_FEE)) / BigInt(100);
            const expectedAmount = projectAmount - fee;
            const project = await escrow.getProject(1);
            const gasPaid = receipt.gasUsed * receipt.gasPrice;

            expect(project.workStatus).to.equal(3);
            expect(project.paymentStatus).to.equal(2);
            expect(afterBalance - beforeBalance + gasPaid).to.equal(expectedAmount);
        });

        it("emits PaymentReleased when submitWork succeeds", async function () {
            const fee = (projectAmount * BigInt(PLATFORM_FEE)) / BigInt(100);
            const expectedAmount = projectAmount - fee;

            await expect(
                escrow.connect(freelancer).submitWork(1)
            ).to.emit(escrow, "PaymentReleased")
             .withArgs(1, freelancer.address, expectedAmount);
        });

        it("fails if a non-freelancer tries to submit", async function () {
            await expect(
                escrow.connect(client).submitWork(1)
            ).to.be.revertedWith("Only project freelancer can call this.");
        });
    });
});
