export type Institutes = {
  uuid: string;
  name: string;
  abbreviation?: string;
  description: string;
  organization: {
    uuid: string;
    name: string;
    description: string;
  };
  modules: string[];
};

export type UserResponse = {
  token: string;
  user: {
    employeeId: string;
    name: string;
    gender?: string;
    dob?: string;
    organizationUuid: string;
    instituteUuid: string;
    designation?: string;
    department?: string;
    division?: string;
    workEmail: string;
    workPhone?: string;
    userType?: string;
    address?: string;
    personal: {
      aadharNumber?: string;
      panNumber?: string;
      bloodGroup?: string;
      maritalStatus?: string;
      fatherName?: string;
    };
    work: {
      employeeId?: string;
      biometricId?: string;
      instituteLocation?: string;
      status?: string;
      responsibilities?: string;
      memberOf?: string;
    };
    institutes: Institutes[];
  };
};
