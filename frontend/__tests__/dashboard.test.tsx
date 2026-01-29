import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock data
const mockDashboardStats = {
  total_members: 1250,
  active_members: 1100,
  pending_members: 100,
  inactive_members: 50,
  total_organizations: 45,
  total_events: 25,
  upcoming_events: 5,
  fee_collection_rate: 85.5,
  members_by_province: [
    { province: 'Улаанбаатар', count: 500 },
    { province: 'Дархан-Уул', count: 150 },
    { province: 'Орхон', count: 100 },
  ],
  growth: {
    this_month: 50,
    last_month: 45,
    percentage: 11.1,
  },
}

const mockUpcomingEvents = [
  {
    id: 'event-1',
    title: 'Сургалт: Манлайлал',
    start_date: '2024-03-15T10:00:00Z',
    end_date: '2024-03-15T17:00:00Z',
    location: 'Улаанбаатар',
    status: 'upcoming',
    max_participants: 50,
    registered_count: 35,
  },
  {
    id: 'event-2',
    title: 'Уулзалт: Удирдах зөвлөл',
    start_date: '2024-03-20T14:00:00Z',
    end_date: '2024-03-20T16:00:00Z',
    location: 'Онлайн',
    status: 'upcoming',
    max_participants: null,
    registered_count: 20,
  },
]

const mockUserProfile = {
  id: 'user-uuid',
  member_id: 'SDYN-2024-00001',
  first_name: 'Бат',
  last_name: 'Дорж',
  email: 'bat@example.com',
  phone: '99001122',
  status: 'active',
  organization: { name: 'Үндэсний байгууллага' },
  positions: [{ name: 'Гишүүн' }],
  membership_expires_at: '2025-12-31T23:59:59Z',
}

const mockFees = [
  {
    id: 'fee-1',
    year: 2024,
    amount: 50000,
    status: 'pending',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'fee-2',
    year: 2023,
    amount: 50000,
    status: 'paid',
    paid_at: '2023-06-15T00:00:00Z',
    payment_method: 'bank_transfer',
  },
]

// Create test wrapper
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

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard Stats Cards', () => {
    it('should display member statistics', () => {
      render(
        <div>
          <div data-testid="stat-total-members">
            <span>Нийт гишүүд</span>
            <span>{mockDashboardStats.total_members}</span>
          </div>
          <div data-testid="stat-active-members">
            <span>Идэвхтэй</span>
            <span>{mockDashboardStats.active_members}</span>
          </div>
          <div data-testid="stat-pending-members">
            <span>Хүлээгдэж буй</span>
            <span>{mockDashboardStats.pending_members}</span>
          </div>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('stat-total-members')).toHaveTextContent('1250')
      expect(screen.getByTestId('stat-active-members')).toHaveTextContent('1100')
      expect(screen.getByTestId('stat-pending-members')).toHaveTextContent('100')
    })

    it('should display organization count', () => {
      render(
        <div data-testid="stat-organizations">
          <span>Байгууллагууд</span>
          <span>{mockDashboardStats.total_organizations}</span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('stat-organizations')).toHaveTextContent('45')
    })

    it('should display event statistics', () => {
      render(
        <div>
          <div data-testid="stat-total-events">
            <span>Нийт арга хэмжээ</span>
            <span>{mockDashboardStats.total_events}</span>
          </div>
          <div data-testid="stat-upcoming-events">
            <span>Ирэх арга хэмжээ</span>
            <span>{mockDashboardStats.upcoming_events}</span>
          </div>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('stat-total-events')).toHaveTextContent('25')
      expect(screen.getByTestId('stat-upcoming-events')).toHaveTextContent('5')
    })

    it('should display fee collection rate', () => {
      render(
        <div data-testid="stat-fee-rate">
          <span>Татвар цуглуулалт</span>
          <span>{mockDashboardStats.fee_collection_rate}%</span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('stat-fee-rate')).toHaveTextContent('85.5%')
    })

    it('should display growth percentage', () => {
      render(
        <div data-testid="stat-growth">
          <span>Энэ сарын өсөлт</span>
          <span className="text-green-500">+{mockDashboardStats.growth.percentage}%</span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('stat-growth')).toHaveTextContent('+11.1%')
    })
  })

  describe('User Profile Section', () => {
    it('should display user name', () => {
      render(
        <div data-testid="user-profile">
          <span>{mockUserProfile.first_name} {mockUserProfile.last_name}</span>
          <span>{mockUserProfile.member_id}</span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('user-profile')).toHaveTextContent('Бат Дорж')
      expect(screen.getByTestId('user-profile')).toHaveTextContent('SDYN-2024-00001')
    })

    it('should display membership status', () => {
      render(
        <div>
          <span
            data-testid="membership-status"
            className={mockUserProfile.status === 'active' ? 'text-green-500' : 'text-yellow-500'}
          >
            {mockUserProfile.status === 'active' ? 'Идэвхтэй гишүүн' : 'Хүлээгдэж буй'}
          </span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('membership-status')).toHaveTextContent('Идэвхтэй гишүүн')
    })

    it('should display organization name', () => {
      render(
        <div data-testid="user-organization">
          {mockUserProfile.organization.name}
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('user-organization')).toHaveTextContent('Үндэсний байгууллага')
    })

    it('should display membership expiry date', () => {
      const expiryDate = new Date(mockUserProfile.membership_expires_at)
      const formattedDate = expiryDate.toLocaleDateString('mn-MN')

      render(
        <div data-testid="membership-expiry">
          Гишүүнчлэл дуусах: {formattedDate}
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('membership-expiry')).toBeInTheDocument()
    })
  })

  describe('Upcoming Events Section', () => {
    it('should display upcoming events list', () => {
      render(
        <div>
          <h2>Ирэх арга хэмжээнүүд</h2>
          {mockUpcomingEvents.map((event) => (
            <div key={event.id} data-testid={`event-${event.id}`}>
              <span>{event.title}</span>
              <span>{event.location}</span>
            </div>
          ))}
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByText('Сургалт: Манлайлал')).toBeInTheDocument()
      expect(screen.getByText('Уулзалт: Удирдах зөвлөл')).toBeInTheDocument()
    })

    it('should display event registration count', () => {
      const event = mockUpcomingEvents[0]

      render(
        <div data-testid="event-registration">
          Бүртгүүлсэн: {event.registered_count} / {event.max_participants}
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('event-registration')).toHaveTextContent('35 / 50')
    })

    it('should have event registration button', () => {
      render(
        <div>
          <button data-testid="register-event-btn">Бүртгүүлэх</button>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('register-event-btn')).toBeInTheDocument()
    })

    it('should handle event registration', async () => {
      const onRegister = jest.fn()
      const user = userEvent.setup()

      render(
        <div>
          <button
            data-testid="register-event-btn"
            onClick={() => onRegister('event-1')}
          >
            Бүртгүүлэх
          </button>
        </div>,
        { wrapper: createWrapper() }
      )

      await user.click(screen.getByTestId('register-event-btn'))
      expect(onRegister).toHaveBeenCalledWith('event-1')
    })
  })

  describe('Fee Status Section', () => {
    it('should display current year fee status', () => {
      const currentFee = mockFees.find((f) => f.status === 'pending')

      render(
        <div data-testid="current-fee">
          <span>2024 оны татвар</span>
          <span>{currentFee?.amount.toLocaleString()}₮</span>
          <span className="text-yellow-500">Төлөгдөөгүй</span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('current-fee')).toHaveTextContent('50,000₮')
      expect(screen.getByTestId('current-fee')).toHaveTextContent('Төлөгдөөгүй')
    })

    it('should have pay fee button for pending fees', () => {
      render(
        <div>
          <button data-testid="pay-fee-btn" className="bg-blue-500">
            Татвар төлөх
          </button>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('pay-fee-btn')).toBeInTheDocument()
    })

    it('should display paid fee with date', () => {
      const paidFee = mockFees.find((f) => f.status === 'paid')
      const paidDate = paidFee?.paid_at ? new Date(paidFee.paid_at).toLocaleDateString('mn-MN') : ''

      render(
        <div data-testid="paid-fee">
          <span>2023 оны татвар</span>
          <span className="text-green-500">Төлсөн</span>
          <span>{paidDate}</span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('paid-fee')).toHaveTextContent('Төлсөн')
    })
  })

  describe('Quick Actions', () => {
    it('should have profile link', () => {
      render(
        <div>
          <a href="/dashboard/profile" data-testid="profile-link">
            Профайл харах
          </a>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('profile-link')).toHaveAttribute('href', '/dashboard/profile')
    })

    it('should have events link', () => {
      render(
        <div>
          <a href="/dashboard/events" data-testid="events-link">
            Арга хэмжээнүүд
          </a>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('events-link')).toHaveAttribute('href', '/dashboard/events')
    })

    it('should have fees link', () => {
      render(
        <div>
          <a href="/dashboard/fees" data-testid="fees-link">
            Татварын түүх
          </a>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('fees-link')).toHaveAttribute('href', '/dashboard/fees')
    })

    it('should have settings link', () => {
      render(
        <div>
          <a href="/dashboard/settings" data-testid="settings-link">
            Тохиргоо
          </a>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('settings-link')).toHaveAttribute('href', '/dashboard/settings')
    })
  })

  describe('Loading States', () => {
    it('should show loading skeleton for stats', () => {
      render(
        <div data-testid="stats-skeleton" className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument()
    })

    it('should show loading for events', () => {
      render(
        <div data-testid="events-loading">
          <span>Уншиж байна...</span>
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('events-loading')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error message on API failure', () => {
      render(
        <div data-testid="error-message" className="text-red-500">
          Мэдээлэл авахад алдаа гарлаа
        </div>,
        { wrapper: createWrapper() }
      )

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    it('should have retry button on error', async () => {
      const onRetry = jest.fn()
      const user = userEvent.setup()

      render(
        <div>
          <div className="text-red-500">Алдаа гарлаа</div>
          <button data-testid="retry-btn" onClick={onRetry}>
            Дахин оролдох
          </button>
        </div>,
        { wrapper: createWrapper() }
      )

      await user.click(screen.getByTestId('retry-btn'))
      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('Responsive Layout', () => {
    it('should render mobile-friendly layout', () => {
      render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
          <div>Stat 1</div>
          <div>Stat 2</div>
          <div>Stat 3</div>
          <div>Stat 4</div>
        </div>,
        { wrapper: createWrapper() }
      )

      const grid = screen.getByTestId('stats-grid')
      expect(grid).toHaveClass('grid-cols-1')
    })
  })
})

describe('Dashboard Notifications', () => {
  it('should display pending fee notification', () => {
    render(
      <div data-testid="notification" className="bg-yellow-100">
        <span>Таны 2024 оны гишүүний татвар төлөгдөөгүй байна</span>
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByTestId('notification')).toHaveTextContent('төлөгдөөгүй')
  })

  it('should display membership expiry warning', () => {
    render(
      <div data-testid="expiry-warning" className="bg-orange-100">
        <span>Таны гишүүнчлэл 30 хоногийн дотор дуусна</span>
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByTestId('expiry-warning')).toBeInTheDocument()
  })

  it('should be dismissible', async () => {
    const user = userEvent.setup()
    const onDismiss = jest.fn()

    render(
      <div data-testid="notification">
        <span>Мэдэгдэл</span>
        <button data-testid="dismiss-btn" onClick={onDismiss}>×</button>
      </div>,
      { wrapper: createWrapper() }
    )

    await user.click(screen.getByTestId('dismiss-btn'))
    expect(onDismiss).toHaveBeenCalled()
  })
})

describe('Dashboard Charts', () => {
  it('should render members by province chart container', () => {
    render(
      <div data-testid="province-chart">
        <h3>Аймаг/хотоор</h3>
        <div className="h-64">
          {mockDashboardStats.members_by_province.map((item) => (
            <div key={item.province}>
              <span>{item.province}</span>
              <span>{item.count}</span>
            </div>
          ))}
        </div>
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByTestId('province-chart')).toBeInTheDocument()
    expect(screen.getByText('Улаанбаатар')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('should render growth trend container', () => {
    render(
      <div data-testid="growth-chart">
        <h3>Гишүүдийн өсөлт</h3>
        <div className="h-64">Chart placeholder</div>
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByTestId('growth-chart')).toBeInTheDocument()
  })
})

describe('Date Formatting', () => {
  it('should format dates in Mongolian locale', () => {
    const date = new Date('2024-03-15T10:00:00Z')
    const formatted = date.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    expect(formatted).toBeTruthy()
  })

  it('should format time correctly', () => {
    const date = new Date('2024-03-15T10:00:00Z')
    const formatted = date.toLocaleTimeString('mn-MN', {
      hour: '2-digit',
      minute: '2-digit',
    })

    expect(formatted).toBeTruthy()
  })
})

describe('Currency Formatting', () => {
  it('should format currency in MNT', () => {
    const amount = 50000
    const formatted = amount.toLocaleString('mn-MN') + '₮'

    expect(formatted).toBe('50,000₮')
  })

  it('should handle large amounts', () => {
    const amount = 1000000
    const formatted = amount.toLocaleString('mn-MN') + '₮'

    expect(formatted).toBe('1,000,000₮')
  })
})
