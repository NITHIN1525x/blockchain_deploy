// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FreelanceEscrow
 * @dev Decentralized escrow contract for freelance marketplace
 *
 * Flow:
 * 1. Client creates escrow → deposits ETH
 * 2. Client releases payment → freelancer gets paid
 * 3. Either party raises dispute → admin resolves
 * 4. Admin can: pay freelancer / refund client / split
 */
contract FreelanceEscrow {

    // ── Enums ──────────────────────────────────────────────────

    enum PaymentStatus {
        Pending,      // 0 - created, no deposit yet
        Locked,       // 1 - ETH deposited in escrow
        Released,     // 2 - paid to freelancer
        Refunded,     // 3 - returned to client
        OnHold        // 4 - dispute raised
    }

    enum WorkStatus {
        InProgress,         // 0
        Submitted,          // 1
        RevisionRequested,  // 2
        Approved            // 3
    }

    // ── Structs ────────────────────────────────────────────────

    struct Project {
        uint256 id;
        address payable client;
        address payable freelancer;
        uint256 amount;          // total escrow in wei
        PaymentStatus paymentStatus;
        WorkStatus workStatus;
        bool exists;
        uint256 createdAt;
    }

    // ── State Variables ────────────────────────────────────────

    address public admin;
    uint256 public projectCounter;
    uint256 public platformFeePercent; // e.g. 2 = 2%

    // projectId => Project
    mapping(uint256 => Project) public projects;

    // track all project IDs per user
    mapping(address => uint256[]) public clientProjects;
    mapping(address => uint256[]) public freelancerProjects;

    // ── Events ─────────────────────────────────────────────────

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 amount
    );

    event PaymentLocked(
        uint256 indexed projectId,
        uint256 amount
    );

    event WorkSubmitted(
        uint256 indexed projectId
    );

    event RevisionRequested(
        uint256 indexed projectId
    );

    event PaymentReleased(
        uint256 indexed projectId,
        address freelancer,
        uint256 amount
    );

    event PaymentRefunded(
        uint256 indexed projectId,
        address client,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed projectId,
        address raisedBy
    );

    event DisputeResolved(
        uint256 indexed projectId,
        string resolution,
        uint256 clientAmount,
        uint256 freelancerAmount
    );

    // ── Modifiers ──────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this.");
        _;
    }

    modifier onlyClient(uint256 projectId) {
        require(
            msg.sender == projects[projectId].client,
            "Only project client can call this."
        );
        _;
    }

    modifier onlyFreelancer(uint256 projectId) {
        require(
            msg.sender == projects[projectId].freelancer,
            "Only project freelancer can call this."
        );
        _;
    }

    modifier onlyProjectMember(uint256 projectId) {
        require(
            msg.sender == projects[projectId].client ||
            msg.sender == projects[projectId].freelancer,
            "Only project members can call this."
        );
        _;
    }

    modifier projectExists(uint256 projectId) {
        require(projects[projectId].exists, "Project does not exist.");
        _;
    }

    // ── Constructor ────────────────────────────────────────────

    constructor(uint256 _platformFeePercent) {
        admin = msg.sender;
        platformFeePercent = _platformFeePercent;
        projectCounter = 0;
    }

    // ── Core Functions ─────────────────────────────────────────

    /**
     * @dev Client creates a new escrow project
     * @param freelancer Address of the freelancer
     * @return projectId The new project's ID
     */
    function createProject(
        address payable freelancer
    ) external returns (uint256) {
        require(freelancer != address(0), "Invalid freelancer address.");
        require(freelancer != msg.sender, "Client and freelancer must be different.");

        projectCounter++;
        uint256 projectId = projectCounter;

        projects[projectId] = Project({
            id: projectId,
            client: payable(msg.sender),
            freelancer: freelancer,
            amount: 0,
            paymentStatus: PaymentStatus.Pending,
            workStatus: WorkStatus.InProgress,
            exists: true,
            createdAt: block.timestamp
        });

        clientProjects[msg.sender].push(projectId);
        freelancerProjects[freelancer].push(projectId);

        emit ProjectCreated(projectId, msg.sender, freelancer, 0);

        return projectId;
    }

    /**
     * @dev Client deposits ETH into escrow
     * @param projectId The project to fund
     */
    function lockPayment(
        uint256 projectId
    ) external payable onlyClient(projectId) projectExists(projectId) {
        Project storage project = projects[projectId];

        require(
            project.paymentStatus == PaymentStatus.Pending,
            "Payment already locked."
        );
        require(msg.value > 0, "Must send ETH to lock payment.");

        project.amount = msg.value;
        project.paymentStatus = PaymentStatus.Locked;

        emit PaymentLocked(projectId, msg.value);
    }

    /**
     * @dev Freelancer submits work and receives payment automatically
     * @param projectId The project ID
     */
    function submitWork(
        uint256 projectId
    ) external onlyFreelancer(projectId) projectExists(projectId) {
        Project storage project = projects[projectId];

        require(
            project.paymentStatus == PaymentStatus.Locked,
            "Payment must be locked before submitting work."
        );
        require(
            project.workStatus == WorkStatus.InProgress ||
            project.workStatus == WorkStatus.RevisionRequested,
            "Work cannot be submitted at this stage."
        );

        uint256 fee = (project.amount * platformFeePercent) / 100;
        uint256 freelancerAmount = project.amount - fee;

        // Update state before transfers.
        project.workStatus = WorkStatus.Approved;
        project.paymentStatus = PaymentStatus.Released;

        emit WorkSubmitted(projectId);

        project.freelancer.transfer(freelancerAmount);
        if (fee > 0) {
            payable(admin).transfer(fee);
        }

        emit PaymentReleased(projectId, project.freelancer, freelancerAmount);
    }

    /**
     * @dev Client requests revision
     * @param projectId The project ID
     */
    function requestRevision(
        uint256 projectId
    ) external onlyClient(projectId) projectExists(projectId) {
        Project storage project = projects[projectId];

        require(
            project.workStatus == WorkStatus.Submitted,
            "No submitted work to request revision on."
        );

        project.workStatus = WorkStatus.RevisionRequested;

        emit RevisionRequested(projectId);
    }

    /**
     * @dev Client approves work and releases payment to freelancer
     * @param projectId The project ID
     */
    function approveAndRelease(
        uint256 projectId
    ) external onlyClient(projectId) projectExists(projectId) {
        Project storage project = projects[projectId];

        require(
            project.workStatus == WorkStatus.Submitted,
            "Work must be submitted before approving."
        );
        require(
            project.paymentStatus == PaymentStatus.Locked,
            "Payment must be locked."
        );

        // Calculate platform fee
        uint256 fee = (project.amount * platformFeePercent) / 100;
        uint256 freelancerAmount = project.amount - fee;

        // Update state before transfer (reentrancy protection)
        project.paymentStatus = PaymentStatus.Released;
        project.workStatus = WorkStatus.Approved;

        // Transfer to freelancer
        project.freelancer.transfer(freelancerAmount);

        // Transfer fee to admin
        if (fee > 0) {
            payable(admin).transfer(fee);
        }

        emit PaymentReleased(projectId, project.freelancer, freelancerAmount);
    }

    /**
     * @dev Either client or freelancer raises a dispute
     * @param projectId The project ID
     */
    function raiseDispute(
        uint256 projectId
    ) external onlyProjectMember(projectId) projectExists(projectId) {
        Project storage project = projects[projectId];

        require(
            project.paymentStatus == PaymentStatus.Locked,
            "No locked payment to dispute."
        );
        require(
            project.paymentStatus != PaymentStatus.OnHold,
            "Dispute already raised."
        );

        // Put payment on hold
        project.paymentStatus = PaymentStatus.OnHold;

        emit DisputeRaised(projectId, msg.sender);
    }

    /**
     * @dev Admin resolves dispute
     * @param projectId The project ID
     * @param resolution "pay_freelancer" | "refund_client" | "split"
     * @param clientAmount Amount to send to client (for split)
     * @param freelancerAmount Amount to send to freelancer (for split)
     */
    function resolveDispute(
        uint256 projectId,
        string memory resolution,
        uint256 clientAmount,
        uint256 freelancerAmount
    ) external onlyAdmin projectExists(projectId) {
        Project storage project = projects[projectId];

        require(
            project.paymentStatus == PaymentStatus.OnHold,
            "No dispute to resolve."
        );

        bytes32 resolutionHash = keccak256(abi.encodePacked(resolution));

        if (resolutionHash == keccak256(abi.encodePacked("pay_freelancer"))) {
            // Full payment to freelancer
            uint256 fee = (project.amount * platformFeePercent) / 100;
            uint256 toFreelancer = project.amount - fee;

            project.paymentStatus = PaymentStatus.Released;

            project.freelancer.transfer(toFreelancer);
            if (fee > 0) payable(admin).transfer(fee);

            emit DisputeResolved(projectId, resolution, 0, toFreelancer);

        } else if (resolutionHash == keccak256(abi.encodePacked("refund_client"))) {
            // Full refund to client
            project.paymentStatus = PaymentStatus.Refunded;

            project.client.transfer(project.amount);

            emit DisputeResolved(projectId, resolution, project.amount, 0);

        } else if (resolutionHash == keccak256(abi.encodePacked("split"))) {
            // Split between both
            require(
                clientAmount + freelancerAmount == project.amount,
                "Split amounts must equal total."
            );

            project.paymentStatus = PaymentStatus.Released;

            if (clientAmount > 0) {
                project.client.transfer(clientAmount);
            }
            if (freelancerAmount > 0) {
                project.freelancer.transfer(freelancerAmount);
            }

            emit DisputeResolved(
                projectId,
                resolution,
                clientAmount,
                freelancerAmount
            );

        } else {
            revert("Invalid resolution type.");
        }
    }

    // ── View Functions ─────────────────────────────────────────

    /**
     * @dev Get project details
     */
    function getProject(
        uint256 projectId
    ) external view returns (Project memory) {
        require(projects[projectId].exists, "Project not found.");
        return projects[projectId];
    }

    /**
     * @dev Get all project IDs for a client
     */
    function getClientProjects(
        address client
    ) external view returns (uint256[] memory) {
        return clientProjects[client];
    }

    /**
     * @dev Get all project IDs for a freelancer
     */
    function getFreelancerProjects(
        address freelancer
    ) external view returns (uint256[] memory) {
        return freelancerProjects[freelancer];
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Admin can update platform fee
     */
    function updatePlatformFee(
        uint256 newFee
    ) external onlyAdmin {
        require(newFee <= 10, "Fee cannot exceed 10%.");
        platformFeePercent = newFee;
    }

    /**
     * @dev Admin can transfer admin role
     */
    function transferAdmin(
        address newAdmin
    ) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address.");
        admin = newAdmin;
    }

    // ── Fallback ───────────────────────────────────────────────

    receive() external payable {}
}
