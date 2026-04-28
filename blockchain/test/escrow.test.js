// test/escrow.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelanceEscrow", function () {
    let escrow;
    let admin, client, freelancer, other;
    const PLATFORM_FEE = 2; // 2%

    beforeEach(async function () {
        [admin, client, freelancer, other] = await ethers.getSigners();

        const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
        escrow = await FreelanceEscrow.deploy(PLATFORM_FEE);
        await escrow.waitForDeployment();
    });

    // ── Deployment ─────────────────────────────────────────────
    describe("Deployment", function () {
        it("Should set admin correctly", async function () {
            expect(await escrow.admin()).to.equal(admin.address);
        });

        it("Should set platform fee correctly", async function () {
            expect(await escrow.platformFeePercent()).to.equal(PLATFORM_FEE);
        });

        it("Should start with zero projects", async function () {
            expect(await escrow.projectCounter()).to.equal(0);
        });
    });

    // ── Create Project ─────────────────────────────────────────
    describe("Create Project", function () {
        it("Should create project successfully", async function () {
            await escrow.connect(client).createProject(freelancer.address);
            expect(await escrow.projectCounter()).to.equal(1);
        });

        it("Should emit ProjectCreated event", async function () {
            await expect(
                escrow.connect(client).createProject(freelancer.address)
            ).to.emit(escrow, "ProjectCreated")
             .withArgs(1, client.address, freelancer.address, 0);
        });

        it("Should fail if client = freelancer", async function () {
            await expect(
                escrow.connect(client).createProject(client.address)
            ).to.be.revertedWith("Client and freelancer must be different.");
        });
    });

    // ── Lock Payment ───────────────────────────────────────────
    describe("Lock Payment", function () {
        beforeEach(async function () {
            await escrow.connect(client).createProject(freelancer.address);
        });

        it("Should lock ETH into escrow", async function () {
            const amount = ethers.parseEther("1.0");
            await escrow.connect(client).lockPayment(1, { value: amount });

            const project = await escrow.getProject(1);
            expect(project.amount).to.equal(amount);
            expect(project.paymentStatus).to.equal(1); // Locked
        });

        it("Should emit PaymentLocked event", async function () {
            const amount = ethers.parseEther("1.0");
            await expect(
                escrow.connect(client).lockPayment(1, { value: amount })
            ).to.emit(escrow, "PaymentLocked")
             .withArgs(1, amount);
        });

        it("Should fail if not client", async function () {
            await expect(
                escrow.connect(freelancer).lockPayment(1, {
                    value: ethers.parseEther("1.0")
                })
            ).to.be.revertedWith("Only project client can call this.");
        });

        it("Should fail if zero ETH", async function () {
            await expect(
                escrow.connect(client).lockPayment(1, { value: 0 })
            ).to.be.revertedWith("Must send ETH to lock payment.");
        });
    });

    // ── Submit Work ────────────────────────────────────────────
    describe("Submit Work", function () {
        beforeEach(async function () {
            await escrow.connect(client).createProject(freelancer.address);
            await escrow.connect(client).lockPayment(1, {
                value: ethers.parseEther("1.0")
            });
        });

        it("Should allow freelancer to submit work", async function () {
            await escrow.connect(freelancer).submitWork(1);
            const project = await escrow.getProject(1);
            expect(project.workStatus).to.equal(1); // Submitted
        });

        it("Should fail if not freelancer", async function () {
            await expect(
                escrow.connect(client).submitWork(1)
            ).to.be.revertedWith("Only project freelancer can call this.");
        });
    });

    // ── Approve & Release ──────────────────────────────────────
    describe("Approve and Release", function () {
        let projectAmount;

        beforeEach(async function () {
            projectAmount = ethers.parseEther("1.0");
            await escrow.connect(client).createProject(freelancer.address);
            await escrow.connect(client).lockPayment(1, { value: projectAmount });
            await escrow.connect(freelancer).submitWork(1);
        });

        it("Should release payment to freelancer minus fee", async function () {
            const beforeBalance = await ethers.provider.getBalance(freelancer.address);

            const tx = await escrow.connect(client).approveAndRelease(1);
            await tx.wait();

            const afterBalance = await ethers.provider.getBalance(freelancer.address);
            const fee = (projectAmount * BigInt(PLATFORM_FEE)) / BigInt(100);
            const expectedAmount = projectAmount - fee;

            // Freelancer should receive amount minus fee
            expect(afterBalance - beforeBalance).to.equal(expectedAmount);
        });

        it("Should emit PaymentReleased event", async function () {
            const fee = (projectAmount * BigInt(PLATFORM_FEE)) / BigInt(100);
            const expectedAmount = projectAmount - fee;

            await expect(
                escrow.connect(client).approveAndRelease(1)
            ).to.emit(escrow, "PaymentReleased")
             .withArgs(1, freelancer.address, expectedAmount);
        });

        it("Should fail if work not submitted", async function () {
            // Create fresh project
            await escrow.connect(client).createProject(freelancer.address);
            await escrow.connect(client).lockPayment(2, { value: projectAmount });

            await expect(
                escrow.connect(client).approveAndRelease(2)
            ).to.be.revertedWith("Work must be submitted before approving.");
        });
    });

    // ── Dispute ────────────────────────────────────────────────
    describe("Dispute Flow", function () {
        beforeEach(async function () {
            await escrow.connect(client).createProject(freelancer.address);
            await escrow.connect(client).lockPayment(1, {
                value: ethers.parseEther("1.0")
            });
        });

        it("Client can raise dispute", async function () {
            await escrow.connect(client).raiseDispute(1);
            const project = await escrow.getProject(1);
            expect(project.paymentStatus).to.equal(4); // OnHold
        });

        it("Freelancer can raise dispute", async function () {
            await escrow.connect(freelancer).raiseDispute(1);
            const project = await escrow.getProject(1);
            expect(project.paymentStatus).to.equal(4); // OnHold
        });

        it("Admin can resolve: pay freelancer", async function () {
            await escrow.connect(client).raiseDispute(1);

            const beforeBalance = await ethers.provider.getBalance(
                freelancer.address
            );

            await escrow.connect(admin).resolveDispute(
                1, "pay_freelancer", 0, 0
            );

            const afterBalance = await ethers.provider.getBalance(
                freelancer.address
            );
            expect(afterBalance).to.be.gt(beforeBalance);
        });

        it("Admin can resolve: refund client", async function () {
            await escrow.connect(client).raiseDispute(1);

            const beforeBalance = await ethers.provider.getBalance(
                client.address
            );

            await escrow.connect(admin).resolveDispute(
                1, "refund_client", 0, 0
            );

            const afterBalance = await ethers.provider.getBalance(
                client.address
            );
            expect(afterBalance).to.be.gt(beforeBalance);
        });

        it("Admin can resolve: split payment", async function () {
            await escrow.connect(client).raiseDispute(1);

            const clientHalf = ethers.parseEther("0.5");
            const freelancerHalf = ethers.parseEther("0.5");

            await expect(
                escrow.connect(admin).resolveDispute(
                    1, "split", clientHalf, freelancerHalf
                )
            ).to.emit(escrow, "DisputeResolved")
             .withArgs(1, "split", clientHalf, freelancerHalf);
        });

        it("Only admin can resolve", async function () {
            await escrow.connect(client).raiseDispute(1);
            await expect(
                escrow.connect(client).resolveDispute(
                    1, "refund_client", 0, 0
                )
            ).to.be.revertedWith("Only admin can call this.");
        });
    });
});
