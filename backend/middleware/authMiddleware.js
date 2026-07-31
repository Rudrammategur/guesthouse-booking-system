const mockUsers = {

    applicant: {

        UserId: 101,

        UserName: "applicant",

        EmployeeId: "EMP001",

        EmployeeName: "Rudramma Tegur",

        EmployeeEmail: "rudrammategur5@gmail.com",

        DepartmentID: "ERP",

        Designation: "System Engineer",

        RoleMapIDs: [42],

        IsAuthenticated: true,
        AuthenticationSource: "Mock"

    },

    verifier: {

        UserId: 269,

        EmployeeId: "EMP002",

        EmployeeName: "Gayatri Rayar",

        EmployeeEmail: "rmtegur218@gmail.com",

        RoleMapIDs: [42,250],

        IsAuthenticated: true,
        AuthenticationSource: "Mock"

    },

    deanAdmin: {

        UserId: 104,

        UserName: "approver",

        EmployeeId: "EMP003",

        EmployeeName: "Dileep A. D.",

        EmployeeEmail: "rudrammategur5@gmail.com",

        DepartmentID: "Administration",

        Designation: "Dean",

        RoleMapIDs: [46],

        IsAuthenticated: true,
        AuthenticationSource: "Mock"

    },

    deanRnD: {

        UserId: 112,

        UserName: "k.kondepu",

        EmployeeId: "EMP005",

        EmployeeName: "Koteswararao Kondepu",

        EmployeeEmail: "rmtegur218@gmail.com",

        DepartmentID: "R&D",

        Designation: "Dean R&D",

        RoleMapIDs: [158],

        IsAuthenticated: true,

        AuthenticationSource: "Mock"

    },

    allocator: {

        UserId: 1401,

        UserName: "allocator",

        EmployeeId: "EMP004",

        EmployeeName: "Anil Kumar",

        EmployeeEmail: "rudrammategur5@gmail.com",

        DepartmentID: "Transit",

        Designation: "Guest House Incharge",

        RoleMapIDs: [251],

        IsAuthenticated: true,
        AuthenticationSource: "Mock"

    }

};

exports.mockLogin = (req, res, next) => {

    const loginAs =
        (req.headers["login-as"] || "applicant");

    req.user =
        mockUsers[loginAs] ||
        mockUsers.applicant;

    console.log("Logged in as:", loginAs);

    console.log(req.user);

    next();

};