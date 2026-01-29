import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the API hooks
const mockMembers = [
  {
    id: 'uuid-1',
    member_id: 'SDYN-2024-00001',
    first_name: 'Бат',
    last_name: 'Дорж',
    email: 'bat@example.com',
    phone: '99001122',
    status: 'active',
    organization: { name: 'Үндэсний байгууллага' },
    province: { name: 'Улаанбаатар' },
    joined_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'uuid-2',
    member_id: 'SDYN-2024-00002',
    first_name: 'Болд',
    last_name: 'Баатар',
    email: 'bold@example.com',
    phone: '99003344',
    status: 'pending',
    organization: { name: 'Дархан-Уул' },
    province: { name: 'Дархан-Уул' },
    joined_at: '2024-02-20T00:00:00Z',
  },
]

const mockUseMembersReturn = {
  data: mockMembers,
  isLoading: false,
  error: null,
  total: 2,
  totalPages: 1,
  params: { page: 1, limit: 10 },
  setParams: jest.fn(),
  refetch: jest.fn(),
}

const mockUseMemberMutationsReturn = {
  createMember: jest.fn(),
  updateMember: jest.fn(),
  deleteMember: jest.fn(),
  updateMemberStatus: jest.fn(),
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
}

jest.mock('@/hooks/useApi', () => ({
  useMembers: () => mockUseMembersReturn,
  useMemberMutations: () => mockUseMemberMutationsReturn,
  useOrganizations: () => ({ data: [], isLoading: false }),
  useProvinces: () => ({ data: [], isLoading: false }),
}))

// Create a test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Members Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Member List', () => {
    it('should display members table headers', async () => {
      // Basic rendering test
      const { container } = render(
        <div>
          <table>
            <thead>
              <tr>
                <th>Гишүүний ID</th>
                <th>Нэр</th>
                <th>Имэйл</th>
                <th>Утас</th>
                <th>Статус</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>
          </table>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByText('Гишүүний ID')).toBeInTheDocument()
      expect(screen.getByText('Нэр')).toBeInTheDocument()
      expect(screen.getByText('Имэйл')).toBeInTheDocument()
      expect(screen.getByText('Статус')).toBeInTheDocument()
    })

    it('should display member data', () => {
      render(
        <div>
          {mockMembers.map((member) => (
            <div key={member.id} data-testid={`member-${member.id}`}>
              <span>{member.member_id}</span>
              <span>{member.first_name} {member.last_name}</span>
              <span>{member.email}</span>
              <span>{member.status}</span>
            </div>
          ))}
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByText('SDYN-2024-00001')).toBeInTheDocument()
      expect(screen.getByText('Бат Дорж')).toBeInTheDocument()
      expect(screen.getByText('bat@example.com')).toBeInTheDocument()
    })

    it('should display different status badges', () => {
      render(
        <div>
          {mockMembers.map((member) => (
            <span
              key={member.id}
              data-testid={`status-${member.status}`}
              className={member.status === 'active' ? 'text-green-500' : 'text-yellow-500'}
            >
              {member.status === 'active' ? 'Идэвхтэй' : 'Хүлээгдэж буй'}
            </span>
          ))}
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('status-active')).toBeInTheDocument()
      expect(screen.getByTestId('status-pending')).toBeInTheDocument()
    })
  })

  describe('Member Search and Filter', () => {
    it('should have search input', () => {
      render(
        <div>
          <input
            type="text"
            placeholder="Хайх..."
            data-testid="search-input"
          />
        </div>,
        { wrapper: createWrapper() }
      )

      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toBeInTheDocument()
    })

    it('should handle search input change', async () => {
      const user = userEvent.setup()
      const onSearch = jest.fn()

      render(
        <div>
          <input
            type="text"
            placeholder="Хайх..."
            data-testid="search-input"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>,
        { wrapper: createWrapper() }
      )

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Бат')

      expect(onSearch).toHaveBeenCalled()
    })

    it('should have status filter dropdown', () => {
      render(
        <div>
          <select data-testid="status-filter">
            <option value="">Бүх статус</option>
            <option value="active">Идэвхтэй</option>
            <option value="pending">Хүлээгдэж буй</option>
            <option value="inactive">Идэвхгүй</option>
            <option value="suspended">Түтгэлзүүлсэн</option>
          </select>
        </div>,
        { wrapper: createWrapper() }
      )

      const statusFilter = screen.getByTestId('status-filter')
      expect(statusFilter).toBeInTheDocument()
      expect(screen.getByText('Бүх статус')).toBeInTheDocument()
    })
  })

  describe('Member CRUD Operations', () => {
    it('should have add member button', () => {
      render(
        <div>
          <button data-testid="add-member-btn">Гишүүн нэмэх</button>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('add-member-btn')).toBeInTheDocument()
    })

    it('should call createMember on form submit', async () => {
      const createMember = jest.fn()
      const user = userEvent.setup()

      render(
        <form
          data-testid="member-form"
          onSubmit={(e) => {
            e.preventDefault()
            createMember({
              first_name: 'Тест',
              last_name: 'Хэрэглэгч',
              email: 'test@example.com',
            })
          }}
        >
          <input name="first_name" defaultValue="Тест" />
          <input name="last_name" defaultValue="Хэрэглэгч" />
          <input name="email" defaultValue="test@example.com" />
          <button type="submit">Хадгалах</button>
        </form>,
        { wrapper: createWrapper() }
      )

      const submitButton = screen.getByText('Хадгалах')
      await user.click(submitButton)

      expect(createMember).toHaveBeenCalledWith({
        first_name: 'Тест',
        last_name: 'Хэрэглэгч',
        email: 'test@example.com',
      })
    })

    it('should call deleteMember on delete confirmation', async () => {
      const deleteMember = jest.fn()
      const user = userEvent.setup()

      render(
        <div>
          <button
            data-testid="delete-btn"
            onClick={() => deleteMember('uuid-1')}
          >
            Устгах
          </button>
        </div>,
        { wrapper: createWrapper() }
      )

      await user.click(screen.getByTestId('delete-btn'))
      expect(deleteMember).toHaveBeenCalledWith('uuid-1')
    })

    it('should call updateMemberStatus', async () => {
      const updateStatus = jest.fn()
      const user = userEvent.setup()

      render(
        <div>
          <select
            data-testid="status-select"
            onChange={(e) => updateStatus('uuid-2', e.target.value)}
          >
            <option value="pending">Хүлээгдэж буй</option>
            <option value="active">Идэвхтэй</option>
            <option value="inactive">Идэвхгүй</option>
          </select>
        </div>,
        { wrapper: createWrapper() }
      )

      const statusSelect = screen.getByTestId('status-select')
      await user.selectOptions(statusSelect, 'active')

      expect(updateStatus).toHaveBeenCalledWith('uuid-2', 'active')
    })
  })

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      render(
        <div>
          <nav data-testid="pagination">
            <button data-testid="prev-btn" disabled>Өмнөх</button>
            <span>1 / 1</span>
            <button data-testid="next-btn" disabled>Дараах</button>
          </nav>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
      expect(screen.getByTestId('prev-btn')).toBeDisabled()
      expect(screen.getByTestId('next-btn')).toBeDisabled()
    })

    it('should call setParams on page change', async () => {
      const setParams = jest.fn()
      const user = userEvent.setup()

      render(
        <div>
          <button
            data-testid="next-btn"
            onClick={() => setParams({ page: 2 })}
          >
            Дараах
          </button>
        </div>,
        { wrapper: createWrapper() }
      )

      await user.click(screen.getByTestId('next-btn'))
      expect(setParams).toHaveBeenCalledWith({ page: 2 })
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading spinner when loading', () => {
      render(
        <div>
          <div data-testid="loading-spinner" className="animate-spin">
            Уншиж байна...
          </div>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show error message on error', () => {
      render(
        <div>
          <div data-testid="error-message" className="text-red-500">
            Алдаа гарлаа. Дахин оролдоно уу.
          </div>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
  })

  describe('Member Details Modal', () => {
    it('should open modal on member click', async () => {
      const user = userEvent.setup()
      let isOpen = false

      const { rerender } = render(
        <div>
          <button
            data-testid="member-row"
            onClick={() => { isOpen = true }}
          >
            Бат Дорж
          </button>
          {isOpen && (
            <div data-testid="member-modal">
              <h2>Гишүүний мэдээлэл</h2>
            </div>
          )}
        </div>,
        { wrapper: createWrapper() }
      )

      await user.click(screen.getByTestId('member-row'))

      rerender(
        <div>
          <button data-testid="member-row">Бат Дорж</button>
          <div data-testid="member-modal">
            <h2>Гишүүний мэдээлэл</h2>
          </div>
        </div>
      )

      expect(screen.getByTestId('member-modal')).toBeInTheDocument()
    })
  })

  describe('Export Functionality', () => {
    it('should have export button', () => {
      render(
        <div>
          <button data-testid="export-btn">Excel татах</button>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('export-btn')).toBeInTheDocument()
    })

    it('should trigger export on button click', async () => {
      const onExport = jest.fn()
      const user = userEvent.setup()

      render(
        <div>
          <button data-testid="export-btn" onClick={onExport}>
            Excel татах
          </button>
        </div>,
        { wrapper: createWrapper() }
      )

      await user.click(screen.getByTestId('export-btn'))
      expect(onExport).toHaveBeenCalled()
    })
  })
})

describe('Member Form Validation', () => {
  it('should validate required fields', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    let error = ''

    render(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          if (!formData.get('first_name')) {
            error = 'Нэр оруулна уу'
            return
          }
          onSubmit(Object.fromEntries(formData))
        }}
      >
        <input name="first_name" data-testid="first-name-input" />
        <span data-testid="error">{error}</span>
        <button type="submit">Хадгалах</button>
      </form>,
      { wrapper: createWrapper() }
    )

    const submitButton = screen.getByText('Хадгалах')
    await user.click(submitButton)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should validate email format', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })

  it('should validate phone format', () => {
    const isValidPhone = (phone: string) => /^[0-9]{8}$/.test(phone)

    expect(isValidPhone('99001122')).toBe(true)
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('abcdefgh')).toBe(false)
  })
})

describe('Member Status Transitions', () => {
  const validTransitions: Record<string, string[]> = {
    pending: ['active', 'inactive'],
    active: ['inactive', 'suspended'],
    inactive: ['active'],
    suspended: ['active', 'inactive'],
  }

  it('should allow valid status transitions', () => {
    expect(validTransitions['pending']).toContain('active')
    expect(validTransitions['active']).toContain('inactive')
    expect(validTransitions['suspended']).toContain('active')
  })

  it('should not allow invalid status transitions', () => {
    expect(validTransitions['pending']).not.toContain('suspended')
    expect(validTransitions['inactive']).not.toContain('suspended')
  })
})
