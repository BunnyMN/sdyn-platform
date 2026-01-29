package models

// Resource represents a system resource that can be protected
type Resource string

const (
	ResourceMember       Resource = "member"
	ResourceOrganization Resource = "organization"
	ResourceEvent        Resource = "event"
	ResourceFee          Resource = "fee"
	ResourceReport       Resource = "report"
	ResourcePosition     Resource = "position"
	ResourceProvince     Resource = "province"
	ResourceDistrict     Resource = "district"
	ResourceSettings     Resource = "settings"
)

// Action represents an action that can be performed on a resource
type Action string

const (
	ActionCreate Action = "create"
	ActionRead   Action = "read"
	ActionUpdate Action = "update"
	ActionDelete Action = "delete"
	ActionList   Action = "list"
	ActionExport Action = "export"
	ActionImport Action = "import"
	ActionApprove Action = "approve"
	ActionReject  Action = "reject"
)

// Permission represents a specific permission (resource + action)
type Permission struct {
	Resource Resource `json:"resource"`
	Action   Action   `json:"action"`
}

// String returns the permission string representation
func (p Permission) String() string {
	return string(p.Resource) + ":" + string(p.Action)
}

// Scope represents the data scope for a permission
type Scope string

const (
	ScopeAll      Scope = "all"      // Can access all data (national_admin)
	ScopeProvince Scope = "province" // Can access province-level data
	ScopeDistrict Scope = "district" // Can access district-level data
	ScopeOwn      Scope = "own"      // Can only access own data
)

// RolePermission defines permissions for a role
type RolePermission struct {
	Role        string       `json:"role"`
	Permissions []Permission `json:"permissions"`
	Scope       Scope        `json:"scope"`
}

// PermissionMatrix defines the complete RBAC permission matrix
var PermissionMatrix = map[string]RolePermission{
	"national_admin": {
		Role:  "national_admin",
		Scope: ScopeAll,
		Permissions: []Permission{
			// Members - Full access
			{ResourceMember, ActionCreate},
			{ResourceMember, ActionRead},
			{ResourceMember, ActionUpdate},
			{ResourceMember, ActionDelete},
			{ResourceMember, ActionList},
			{ResourceMember, ActionExport},
			{ResourceMember, ActionImport},
			{ResourceMember, ActionApprove},
			{ResourceMember, ActionReject},
			// Organizations - Full access
			{ResourceOrganization, ActionCreate},
			{ResourceOrganization, ActionRead},
			{ResourceOrganization, ActionUpdate},
			{ResourceOrganization, ActionDelete},
			{ResourceOrganization, ActionList},
			// Events - Full access
			{ResourceEvent, ActionCreate},
			{ResourceEvent, ActionRead},
			{ResourceEvent, ActionUpdate},
			{ResourceEvent, ActionDelete},
			{ResourceEvent, ActionList},
			{ResourceEvent, ActionExport},
			// Fees - Full access
			{ResourceFee, ActionCreate},
			{ResourceFee, ActionRead},
			{ResourceFee, ActionUpdate},
			{ResourceFee, ActionDelete},
			{ResourceFee, ActionList},
			{ResourceFee, ActionExport},
			{ResourceFee, ActionApprove},
			// Reports - Full access
			{ResourceReport, ActionRead},
			{ResourceReport, ActionExport},
			// Positions - Full access
			{ResourcePosition, ActionCreate},
			{ResourcePosition, ActionRead},
			{ResourcePosition, ActionUpdate},
			{ResourcePosition, ActionDelete},
			{ResourcePosition, ActionList},
			// Settings - Full access
			{ResourceSettings, ActionRead},
			{ResourceSettings, ActionUpdate},
			// Province/District - Full access
			{ResourceProvince, ActionRead},
			{ResourceProvince, ActionList},
			{ResourceDistrict, ActionRead},
			{ResourceDistrict, ActionList},
		},
	},
	"province_admin": {
		Role:  "province_admin",
		Scope: ScopeProvince,
		Permissions: []Permission{
			// Members - Province scope
			{ResourceMember, ActionCreate},
			{ResourceMember, ActionRead},
			{ResourceMember, ActionUpdate},
			{ResourceMember, ActionList},
			{ResourceMember, ActionExport},
			{ResourceMember, ActionApprove},
			{ResourceMember, ActionReject},
			// Organizations - Province scope (read only sub-orgs)
			{ResourceOrganization, ActionRead},
			{ResourceOrganization, ActionUpdate},
			{ResourceOrganization, ActionList},
			// Events - Province scope
			{ResourceEvent, ActionCreate},
			{ResourceEvent, ActionRead},
			{ResourceEvent, ActionUpdate},
			{ResourceEvent, ActionDelete},
			{ResourceEvent, ActionList},
			{ResourceEvent, ActionExport},
			// Fees - Province scope
			{ResourceFee, ActionCreate},
			{ResourceFee, ActionRead},
			{ResourceFee, ActionUpdate},
			{ResourceFee, ActionList},
			{ResourceFee, ActionExport},
			{ResourceFee, ActionApprove},
			// Reports - Province scope
			{ResourceReport, ActionRead},
			{ResourceReport, ActionExport},
			// Positions - Read only
			{ResourcePosition, ActionRead},
			{ResourcePosition, ActionList},
			// Province/District - Read only
			{ResourceProvince, ActionRead},
			{ResourceProvince, ActionList},
			{ResourceDistrict, ActionRead},
			{ResourceDistrict, ActionList},
		},
	},
	"district_admin": {
		Role:  "district_admin",
		Scope: ScopeDistrict,
		Permissions: []Permission{
			// Members - District scope
			{ResourceMember, ActionCreate},
			{ResourceMember, ActionRead},
			{ResourceMember, ActionUpdate},
			{ResourceMember, ActionList},
			{ResourceMember, ActionExport},
			// Organizations - District scope (read only)
			{ResourceOrganization, ActionRead},
			{ResourceOrganization, ActionList},
			// Events - District scope
			{ResourceEvent, ActionCreate},
			{ResourceEvent, ActionRead},
			{ResourceEvent, ActionUpdate},
			{ResourceEvent, ActionList},
			// Fees - District scope
			{ResourceFee, ActionCreate},
			{ResourceFee, ActionRead},
			{ResourceFee, ActionUpdate},
			{ResourceFee, ActionList},
			// Reports - District scope
			{ResourceReport, ActionRead},
			// Positions - Read only
			{ResourcePosition, ActionRead},
			{ResourcePosition, ActionList},
			// Province/District - Read only
			{ResourceProvince, ActionRead},
			{ResourceProvince, ActionList},
			{ResourceDistrict, ActionRead},
			{ResourceDistrict, ActionList},
		},
	},
	"member": {
		Role:  "member",
		Scope: ScopeOwn,
		Permissions: []Permission{
			// Members - Own data only
			{ResourceMember, ActionRead},
			{ResourceMember, ActionUpdate},
			// Organizations - Read only
			{ResourceOrganization, ActionRead},
			{ResourceOrganization, ActionList},
			// Events - Read and register
			{ResourceEvent, ActionRead},
			{ResourceEvent, ActionList},
			// Fees - Own data only
			{ResourceFee, ActionRead},
			{ResourceFee, ActionList},
			// Province/District - Read only
			{ResourceProvince, ActionRead},
			{ResourceProvince, ActionList},
			{ResourceDistrict, ActionRead},
			{ResourceDistrict, ActionList},
		},
	},
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID             string                 `json:"id"`
	Timestamp      string                 `json:"timestamp"`
	UserID         string                 `json:"user_id"`
	MemberID       string                 `json:"member_id,omitempty"`
	Email          string                 `json:"email,omitempty"`
	Action         string                 `json:"action"`
	Resource       string                 `json:"resource"`
	ResourceID     string                 `json:"resource_id,omitempty"`
	OrganizationID string                 `json:"organization_id,omitempty"`
	IPAddress      string                 `json:"ip_address"`
	UserAgent      string                 `json:"user_agent"`
	Status         string                 `json:"status"` // success, denied, error
	StatusCode     int                    `json:"status_code"`
	ErrorMessage   string                 `json:"error_message,omitempty"`
	RequestMethod  string                 `json:"request_method"`
	RequestPath    string                 `json:"request_path"`
	RequestBody    map[string]interface{} `json:"request_body,omitempty"`
	ResponseTime   int64                  `json:"response_time_ms"`
	Changes        map[string]interface{} `json:"changes,omitempty"`
}

// TokenBlacklist represents a blacklisted token
type TokenBlacklist struct {
	TokenID   string `json:"token_id"` // jti claim
	UserID    string `json:"user_id"`
	ExpiresAt int64  `json:"expires_at"`
	RevokedAt int64  `json:"revoked_at"`
	Reason    string `json:"reason"`
}
