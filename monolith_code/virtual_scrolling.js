import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Virtual Scrolling Hook
export const useVirtualScrolling = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  onLoadMore = null
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  const totalHeight = items.length * itemHeight;
  const viewportHeight = containerHeight;
  
  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const end = Math.min(start + visibleCount, items.length);

    // Add overscan for smooth scrolling
    const overscanStart = Math.max(0, start - overscan);
    const overscanEnd = Math.min(items.length, end + overscan);

    return {
      startIndex: overscanStart,
      endIndex: overscanEnd,
      visibleItems: items.slice(overscanStart, overscanEnd)
    };
  }, [scrollTop, itemHeight, viewportHeight, items.length, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);

    // Trigger load more when near bottom
    if (onLoadMore && items.length > 0) {
      const scrollPercentage = (newScrollTop + viewportHeight) / totalHeight;
      if (scrollPercentage > 0.8) { // Load more when 80% scrolled
        onLoadMore();
      }
    }
  }, [onLoadMore, viewportHeight, totalHeight, items.length]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index) => {
    if (scrollElementRef.current) {
      const targetScrollTop = Math.max(0, index * itemHeight);
      scrollElementRef.current.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [itemHeight]);

  return {
    scrollElementRef,
    handleScroll,
    scrollToIndex,
    totalHeight,
    startIndex,
    endIndex,
    visibleItems,
    offsetY: startIndex * itemHeight
  };
};

// Virtual List Component
export const VirtualList = ({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
  style = {},
  onLoadMore = null,
  loadingMore = false,
  noItemsMessage = 'No items to display',
  overscan = 5
}) => {
  const {
    scrollElementRef,
    handleScroll,
    scrollToIndex,
    totalHeight,
    startIndex,
    endIndex,
    visibleItems,
    offsetY
  } = useVirtualScrolling({
    items,
    itemHeight,
    containerHeight: height,
    overscan,
    onLoadMore
  });

  return (
    <div
      ref={scrollElementRef}
      className={`virtual-list ${className}`}
      style={{
        height,
        overflow: 'auto',
        ...style
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666'
            }}>
              {noItemsMessage}
            </div>
          ) : (
            visibleItems.map((item, index) => (
              <div
                key={startIndex + index}
                style={{
                  height: itemHeight,
                  overflow: 'hidden'
                }}
              >
                {renderItem(item, startIndex + index)}
              </div>
            ))
          )}
          
          {loadingMore && (
            <div style={{
              height: itemHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              Loading more items...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Virtual CVE List for DDoS Dashboard
export const VirtualCVEList = ({
  cves,
  height = 600,
  onLoadMore = null,
  loadingMore = false,
  onCVEClick = null,
  theme
}) => {
  const itemHeight = 120; // Height for each CVE item

  const renderCVEItem = useCallback((cve, index) => (
    <div
      style={{
        background: 'white',
        border: `1px solid ${theme?.cream || '#f0f0f0'}`,
        borderRadius: '8px',
        margin: '8px',
        padding: '16px',
        cursor: onCVEClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        height: itemHeight - 16 // Account for margin
      }}
      onClick={() => onCVEClick && onCVEClick(cve)}
      onMouseEnter={(e) => {
        if (onCVEClick) {
          e.currentTarget.style.borderColor = theme?.lightAccent || '#FFA559';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onCVEClick) {
          e.currentTarget.style.borderColor = theme?.cream || '#f0f0f0';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* CVE Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ 
          color: theme?.primary || '#454545', 
          fontSize: '1.1rem',
          fontWeight: '700',
          margin: 0
        }}>
          {cve.id}
        </h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {cve.confidence && (
            <span style={{
              background: cve.confidence >= 80 ? '#e74c3c' : cve.confidence >= 60 ? '#f39c12' : '#3498db',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}>
              {Math.round(cve.confidence)}%
            </span>
          )}
          {cve.cvssScore && (
            <span style={{
              background: cve.cvssScore >= 7 ? '#e74c3c' : cve.cvssScore >= 4 ? '#f39c12' : '#27ae60',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}>
              CVSS {cve.cvssScore}
            </span>
          )}
        </div>
      </div>

      {/* CVE Description */}
      <p style={{ 
        color: '#666', 
        fontSize: '0.9rem',
        lineHeight: '1.4',
        margin: '0 0 8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {cve.description || 'No description available'}
      </p>

      {/* CVE Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {cve.attackType && (
          <span style={{
            background: `${theme?.accent || '#FF6000'}20`,
            color: theme?.accent || '#FF6000',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '500'
          }}>
            {cve.attackType}
          </span>
        )}
        {cve.industry && (
          <span style={{
            background: `${theme?.primary || '#454545'}20`,
            color: theme?.primary || '#454545',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '500'
          }}>
            {cve.industry}
          </span>
        )}
        {cve.protocol && (
          <span style={{
            background: '#f0f0f0',
            color: '#666',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '500'
          }}>
            {cve.protocol}
          </span>
        )}
        {cve.publishedDate && (
          <span style={{
            background: '#f8f9fa',
            color: '#666',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem'
          }}>
            {cve.publishedDate}
          </span>
        )}
      </div>
    </div>
  ), [onCVEClick, theme, itemHeight]);

  return (
    <VirtualList
      items={cves}
      itemHeight={itemHeight}
      height={height}
      renderItem={renderCVEItem}
      onLoadMore={onLoadMore}
      loadingMore={loadingMore}
      noItemsMessage="No CVEs found matching your criteria"
      className="virtual-cve-list"
    />
  );
};

// Virtual Threat Intelligence List
export const VirtualThreatList = ({
  threats,
  height = 500,
  onLoadMore = null,
  loadingMore = false,
  onThreatClick = null,
  theme
}) => {
  const itemHeight = 100;

  const renderThreatItem = useCallback((threat, index) => (
    <div
      style={{
        background: 'white',
        border: `1px solid ${theme?.cream || '#f0f0f0'}`,
        borderRadius: '8px',
        margin: '6px',
        padding: '12px',
        cursor: onThreatClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        height: itemHeight - 12
      }}
      onClick={() => onThreatClick && onThreatClick(threat)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h5 style={{ 
          color: theme?.primary || '#454545', 
          fontSize: '1rem',
          fontWeight: '600',
          margin: 0
        }}>
          {threat.ip || threat.name || 'Unknown Threat'}
        </h5>
        <span style={{
          background: threat.reputation === 'Malicious' ? '#e74c3c' : '#f39c12',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600'
        }}>
          {threat.reputation || 'Unknown'}
        </span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
        <span>{threat.country || 'Unknown Location'}</span>
        <span>{threat.attackCount || 0} attacks</span>
        <span>{threat.confidence || 0}% confidence</span>
      </div>
    </div>
  ), [onThreatClick, theme, itemHeight]);

  return (
    <VirtualList
      items={threats}
      itemHeight={itemHeight}
      height={height}
      renderItem={renderThreatItem}
      onLoadMore={onLoadMore}
      loadingMore={loadingMore}
      noItemsMessage="No threat data available"
      className="virtual-threat-list"
    />
  );
};

// Pagination Hook for API integration
export const usePaginatedData = ({ 
  fetchFunction, 
  pageSize = 50, 
  initialParams = {} 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const loadPage = useCallback(async (page = 0, append = false) => {
    if (loading || loadingMore) return;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setData([]);
      }

      setError(null);

      const params = {
        ...initialParams,
        limit: pageSize,
        offset: page * pageSize
      };

      const result = await fetchFunction(params);
      
      if (result.vulnerabilities) {
        // NVD format
        const newData = result.vulnerabilities;
        setData(prev => append ? [...prev, ...newData] : newData);
        setTotalCount(result.totalResults || newData.length);
        setHasMore(newData.length === pageSize && (result.totalResults > (page + 1) * pageSize));
      } else if (Array.isArray(result)) {
        // Simple array format
        setData(prev => append ? [...prev, ...result] : result);
        setHasMore(result.length === pageSize);
      } else {
        throw new Error('Unexpected response format');
      }

      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchFunction, pageSize, initialParams, loading, loadingMore]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadPage(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, currentPage, loadPage]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setHasMore(true);
    loadPage(0, false);
  }, [loadPage]);

  // Initial load
  useEffect(() => {
    loadPage(0, false);
  }, []);

  return {
    data,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    currentPage,
    loadMore,
    refresh,
    reload: () => loadPage(currentPage, false)
  };
};