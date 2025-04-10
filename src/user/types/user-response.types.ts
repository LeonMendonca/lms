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

export type CreateUserResponse = {
  message: string;
  employee: {
    employeeUuid: string;
    firstName: string;
    lastName: string;
    workEmail: string;
    designation: string;
  };
};

export type EmployeeInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  shortName?: string;
  gender: string;
  dateOfJoining?: string; // ISO date string
  salute?: string;
  instituteUuid: string[];

  // EmployeeWork fields
  employeeId: string;
  employeeBiometricId?: string;
  department?: string;
  designation?: string;
  employeeType?: string;
  division?: string;
  instituteLocation?: string;
  employeeStatus?: string;
  jobResponsibility?: string[];
  memberOf?: string;

  // EmployeeLoginDetails fields
  workEmail: string;
  workPhone?: string;
  userType?: 'ADMIN' | 'EMPLOYEE' | 'MANAGER';
  reportingTo?: string;
  password?: string;

  // EmployeePersonal fields
  aadharNumber?: string;
  panNumber?: string;
  bloodGroup?: 
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE';
  dob?: string; // ISO date string
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  fatherName?: string;
  address?: Record<string, any>; // Could be more specific if you have a shape
  currentAddress?: Record<string, any>;
};
