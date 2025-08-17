// src/components/pages/Analytics/index.tsx
import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Select, 
  Input, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Badge, 
  Spin,
  Typography,
  Divider,
  Progress,
  Tooltip,
  message
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  DownloadOutlined, 
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
  AlertOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Activity,
  Database,
  Network
} from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';

// Import engines and services
import { DDoSCorrelationEngine } from '@engines/DDoSCorrelationEngine';
import { useAPIOrchestrator } from '@hooks/api/useAPIOrchestrator';
import { useCVEData } from '@hooks/api/useCVEData';
import { theme, getSeverityColor, getConfidenceColor } from '@utils/constants/theme';
import { CVEData, FilterState } from '@types/cve.types';

// Lazy load heavy components
const CVEDetailsModal = lazy(() => import('./CVEDetailsModal'));
const AdvancedFilters = lazy(() => import('./AdvancedFilters'));
const AnalyticsCharts = lazy(() => import('./AnalyticsCharts'));

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Component styles using CSS modules (migrated from inline)
import styles from './Analytics.module.css';

const AnalyticsPage: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<FilterState>({
    attackType: '',
    industry: '',
    minCVSS: 0,
    maxCVSS: 10,
    dateRange: null,
    protocol: '',
    confidence: 0,
    searchTerm: ''
  });

  const [selectedCVE, setSelectedCVE] = useState<CVEData | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // API hooks
  const apiOrchestrator = useAPIOrchestrator();
  const correlationEngine = useMemo(
    () => new DDoSCorrelationEngine(apiOrchestrator),
    [apiOrchestrator]
  );

  // Fetch CVE data with pagination
  const {
    data: cveData,
    loading,
    error,
    totalCount,
    loadMore,
    refresh,
    hasMore
  } = useCVEData({
    filters,
    pageSize: 50,
    correlationEngine
  });

  // Statistics calculation (migrated from inline calculation)
  const statistics = useMemo(() => {
    if (!cveData || cveData.length === 0) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        avgConfidence: 0,
        recentAttacks: 0
      };
    }

    const critical = cveData.filter(cve => parseFloat(cve.cvssScore) >= 9.0).length;
    const high = cveData.filter(cve => parseFloat(cve.cvssScore) >= 7.0).length;
    const avgConfidence = cveData.reduce((sum, cve) => sum + cve.confidence, 0) / cveData.length;
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentAttacks = cveData.filter(cve => 
      new Date(cve.publishedDate).getTime() > thirtyDaysAgo
    ).length;

    return {
      total: totalCount || cveData.length,
      critical,
      high,
      avgConfidence: Math.round(avgConfidence),
      recentAttacks
    };
  }, [cveData, totalCount]);

  // Table columns definition (migrated from inline JSX)
  const columns: ColumnsType<CVEData> = [
    {
      title: 'CVE ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      fixed: 'left',
      render: (id: string) => (
        <Button type="link" onClick={() => handleCVEClick(id)}>
          {id}
        </Button>
      ),
      sorter: (a, b) => a.id.localeCompare(b.id)
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 120,
      render: (confidence: number) => (
        <Progress
          percent={confidence}
          size="small"
          strokeColor={getConfidenceColor(confidence)}
          format={(percent) => `${percent}%`}
        />
      ),
      sorter: (a, b) => a.confidence - b.confidence
    },
    {
      title: 'Attack Type',
      dataIndex: 'attackType',
      key: 'attackType',
      width: 140,
      render: (type: string) => (
        <Tag color={theme.attack[type.toLowerCase()] || 'default'}>
          {type}
        </Tag>
      ),
      filters: [
        { text: 'Volumetric', value: 'Volumetric' },
        { text: 'Protocol', value: 'Protocol' },
        { text: 'Application', value: 'Application' },
        { text: 'Amplification', value: 'Amplification' }
      ],
      onFilter: (value, record) => record.attackType === value
    },
    {
      title: 'CVSS Score',
      dataIndex: 'cvssScore',
      key: 'cvssScore',
      width: 100,
      render: (score: string) => (
        <Badge
          count={score}
          style={{ backgroundColor: getSeverityColor(score) }}
          overflowCount={10}
        />
      ),
      sorter: (a, b) => parseFloat(a.cvssScore) - parseFloat(b.cvssScore)
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 120,
      render: (protocol: string) => (
        <Tag color={theme.protocol[protocol] || 'blue'}>
          {protocol}
        </Tag>
      )
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      width: 130,
      render: (industry: string) => (
        <Text type="secondary">{industry}</Text>
      )
    },
    {
      title: 'Published Date',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime()
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
            {description}
          </Paragraph>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<AlertOutlined />}
            onClick={() => handleAnalyze(record)}
          />
          <Button
            type="text"
            icon={<SafetyOutlined />}
            onClick={() => handleMitigate(record)}
          />
        </Space>
      )
    }
  ];

  // Event handlers
  const handleCVEClick = (cveId: string) => {
    const cve = cveData?.find(c => c.id === cveId);
    if (cve) {
      setSelectedCVE(cve);
    }
  };

  const handleAnalyze = async (cve: CVEData) => {
    message.info(`Analyzing ${cve.id}...`);
    // Implement analysis logic
  };

  const handleMitigate = (cve: CVEData) => {
    message.info(`Opening mitigation strategies for ${cve.id}`);
    // Implement mitigation logic
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Implement export logic
      message.success('Data exported successfully');
    } catch (error) {
      message.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className={styles.analyticsContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <Title level={2}>
          <Shield className={styles.titleIcon} />
          DDoS CVE Analytics Dashboard
        </Title>
        <Paragraph type="secondary">
          Real-time correlation and analysis of DDoS-related vulnerabilities
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsSection}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total DDoS CVEs"
              value={statistics.total}
              prefix={<Database />}
              valueStyle={{ color: theme.colors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Critical Severity"
              value={statistics.critical}
              prefix={<AlertTriangle />}
              valueStyle={{ color: theme.semantic.critical }}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  / {statistics.high} High
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Avg Confidence"
              value={statistics.avgConfidence}
              suffix="%"
              prefix={<TrendingUp />}
              valueStyle={{ color: getConfidenceColor(statistics.avgConfidence) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Recent (30 days)"
              value={statistics.recentAttacks}
              prefix={<Activity />}
              valueStyle={{ color: theme.colors.accent }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters Section */}
      <Card className={styles.filtersCard}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Main Filters Row */}
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search CVE IDs, descriptions, vendors..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                allowClear
                size="large"
              />
            </Col>
            <Col>
              <Select
                placeholder="Attack Type"
                style={{ width: 150 }}
                value={filters.attackType}
                onChange={(value) => setFilters({ ...filters, attackType: value })}
                allowClear
              >
                <Select.Option value="Volumetric">Volumetric</Select.Option>
                <Select.Option value="Protocol">Protocol</Select.Option>
                <Select.Option value="Application">Application</Select.Option>
                <Select.Option value="Amplification">Amplification</Select.Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Protocol"
                style={{ width: 130 }}
                value={filters.protocol}
                onChange={(value) => setFilters({ ...filters, protocol: value })}
                allowClear
              >
                <Select.Option value="HTTP/HTTPS">HTTP/HTTPS</Select.Option>
                <Select.Option value="DNS">DNS</Select.Option>
                <Select.Option value="UDP">UDP</Select.Option>
                <Select.Option value="TCP">TCP</Select.Option>
                <Select.Option value="ICMP">ICMP</Select.Option>
              </Select>
            </Col>
            <Col>
              <RangePicker
                style={{ width: 250 }}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  Advanced
                </Button>
                <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  loading={exportLoading}
                >
                  Export
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Advanced Filters (Lazy Loaded) */}
          {showAdvancedFilters && (
            <Suspense fallback={<Spin />}>
              <AdvancedFilters
                filters={filters}
                onChange={setFilters}
              />
            </Suspense>
          )}
        </Space>
      </Card>

      {/* Data Table */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={cveData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: totalCount,
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} CVEs`,
            showQuickJumper: true
          }}
          scroll={{ x: 1500 }}
          onChange={(pagination, filters, sorter) => {
            // Handle table changes
          }}
        />
      </Card>

      {/* Analytics Charts (Lazy Loaded) */}
      <Suspense fallback={<Spin size="large" />}>
        <AnalyticsCharts data={cveData} />
      </Suspense>

      {/* CVE Details Modal (Lazy Loaded) */}
      {selectedCVE && (
        <Suspense fallback={<Spin />}>
          <CVEDetailsModal
            cve={selectedCVE}
            visible={!!selectedCVE}
            onClose={() => setSelectedCVE(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AnalyticsPage;