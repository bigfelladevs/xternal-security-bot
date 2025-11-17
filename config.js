module.exports = {
    BotInformation: {
        MainGuild: "mainguild",
        ClientID: "clientid",
        BotToken: "token",

        ActivityTask: "w/ Big Guys!", // Playing ...  |  Watching ...  |  Listening to ...  |  Competing in ... 
        ActivityType: "Playing" // Playing, Watching, Listening, Competing, Streaming
    },

    CommunityInfo: {
        ServerName: "FiveM Roleplay",
        Abreviation: "5MRP",
        ServerLogo: "https://i.imgur.com/hi5nHvi.png"
    },

    DiscordInformation: {
        Leadership: "", // Will be eligible to execute all commands.
        AdminRole: "", // Will be eligible to execute staff commands and (massban, masskick)
        JrAdminRole: "", // Will be eligible to execute staff commands and (masskick)
        SStaffRole: "", // Will be eligible to execute all staff commands. -> (Ex: massnick, massmute, massunmute, tspass, userupdate)
        StaffRole: "", // Will be eligible to execute all staff commands. -> (Ex: massnick, massmute, massunmute, tspass, userupdate)
        SiTRole: "", // Will be eligible to execute all staff commands. -> (Ex: massnick, massmute, massunmute, tspass, userupdate)
        MemberRole: "", // Will not be eligible to execute any restricted commands.
        RecruitRole: "", // Will not be eligible to execute any restricted commands.

        // Mass Mute Command Information
        UICategory: "", // This is the category in which muted channels will be created.
        SeeAdminRole: "", // Will be assigned to any user who gets (massmuted)
        
        // Self Role Command Information
        PoliceDept: "",
        StatePolice: "",
        CivDepartment: "",
        SheriffsOffice: "",
        Communications: "",
        FireDepartment: "",
        PatrolNotified: "",
        MediaNotified: "",
        DevNotified: "",

        // Verify Command (Departments)
        VerifyStatePolice: "",
        VerifySheriff: "",
        VerifyPoliceDept: "",
        VerifyCivDept: "",
        VerifyFireDept: "",
        VerifyDevelopment: "",
        VerifyMediaTeam: "",
        VerifyCommsDept: "",

        // Verification Channel Category
        VerifyCategory: "",

        // Bot Log Channel(s)
        VerifyLogs: "", // For: All actions related to verifying new membership.
        GeneralLogs: "", // For: "selfnick", "selfrole", "massnick", "userinfo"
        ExternalLogs: "", // For: "massmute", "massunmute", "masskick", "massban", "massunban"

        // Bot Command Channel(s)
        BotCommands: "", // This is where (membership accessible) general commands will have to be executed. (Ex: selfnick, selfrole, massnick, userinfo)
        StaffCommands: "", // This is where (staff accessible) commands will have to be executed. (Ex: massnick, massmute, massunmute, tspass, userupdate)
        AdminCommands: "" // This is where (admin accessible) commands will have to be executed. (Ex: * staff commands ⤴ * + massban, massunban, masskick)
    },
}