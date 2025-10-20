/**
 * 이미지 로딩 성능 측정 Composable
 * 사용법: const { measureImageLoad, getPerformanceReport } = useImagePerformance()
 */
export const useImagePerformance = () => {
  const measurements = ref([]);
  
  /**
   * 이미지 로딩 시간 측정
   * @param {string} imageUrl - 측정할 이미지 URL
   * @param {string} category - 이미지 카테고리 (concert, musical, popup 등)
   * @returns {Promise} 측정 결과
   */
  const measureImageLoad = (imageUrl, category = 'unknown') => {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        const measurement = {
          url: imageUrl,
          category,
          loadTime: loadTime.toFixed(2),
          timestamp: new Date().toISOString(),
          success: true
        };
        
        measurements.value.push(measurement);
        console.log(`✅ [${category}] 이미지 로드: ${loadTime.toFixed(2)}ms - ${imageUrl}`);
        resolve(measurement);
      };
      
      img.onerror = () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        const measurement = {
          url: imageUrl,
          category,
          loadTime: loadTime.toFixed(2),
          timestamp: new Date().toISOString(),
          success: false,
          error: 'Image load failed'
        };
        
        measurements.value.push(measurement);
        console.error(`❌ [${category}] 이미지 로드 실패: ${loadTime.toFixed(2)}ms - ${imageUrl}`);
        reject(measurement);
      };
      
      img.src = imageUrl;
    });
  };
  
  /**
   * 성능 리포트 생성
   * @returns {Object} 통계 정보
   */
  const getPerformanceReport = () => {
    if (measurements.value.length === 0) {
      return {
        totalImages: 0,
        message: '측정된 이미지가 없습니다.'
      };
    }
    
    const successfulLoads = measurements.value.filter(m => m.success);
    const failedLoads = measurements.value.filter(m => !m.success);
    const loadTimes = successfulLoads.map(m => parseFloat(m.loadTime));
    
    // 카테고리별 통계
    const categoryStats = {};
    successfulLoads.forEach(m => {
      if (!categoryStats[m.category]) {
        categoryStats[m.category] = {
          count: 0,
          totalTime: 0,
          times: []
        };
      }
      categoryStats[m.category].count++;
      categoryStats[m.category].totalTime += parseFloat(m.loadTime);
      categoryStats[m.category].times.push(parseFloat(m.loadTime));
    });
    
    // 카테고리별 평균 계산
    Object.keys(categoryStats).forEach(category => {
      const stat = categoryStats[category];
      stat.average = (stat.totalTime / stat.count).toFixed(2);
      stat.min = Math.min(...stat.times).toFixed(2);
      stat.max = Math.max(...stat.times).toFixed(2);
    });
    
    const report = {
      totalImages: measurements.value.length,
      successfulLoads: successfulLoads.length,
      failedLoads: failedLoads.length,
      totalLoadTime: loadTimes.reduce((a, b) => a + b, 0).toFixed(2),
      averageLoadTime: loadTimes.length > 0 
        ? (loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length).toFixed(2) 
        : 0,
      minLoadTime: loadTimes.length > 0 ? Math.min(...loadTimes).toFixed(2) : 0,
      maxLoadTime: loadTimes.length > 0 ? Math.max(...loadTimes).toFixed(2) : 0,
      categoryStats,
      measurements: measurements.value
    };
    
    return report;
  };
  
  /**
   * 성능 리포트 콘솔 출력
   */
  const printPerformanceReport = () => {
    const report = getPerformanceReport();
    
    console.log('\n📊 ========== 이미지 로딩 성능 리포트 ==========');
    console.log(`총 이미지 수: ${report.totalImages}개`);
    console.log(`성공: ${report.successfulLoads}개 | 실패: ${report.failedLoads}개`);
    console.log(`총 로딩 시간: ${report.totalLoadTime}ms`);
    console.log(`평균 로딩 시간: ${report.averageLoadTime}ms`);
    console.log(`최소 로딩 시간: ${report.minLoadTime}ms`);
    console.log(`최대 로딩 시간: ${report.maxLoadTime}ms`);
    
    console.log('\n📁 카테고리별 통계:');
    Object.entries(report.categoryStats).forEach(([category, stats]) => {
      console.log(`  [${category}]`);
      console.log(`    - 개수: ${stats.count}개`);
      console.log(`    - 평균: ${stats.average}ms`);
      console.log(`    - 최소/최대: ${stats.min}ms / ${stats.max}ms`);
    });
    
    console.log('\n===============================================\n');
    
    return report;
  };
  
  /**
   * 측정 데이터 초기화
   */
  const clearMeasurements = () => {
    measurements.value = [];
  };
  
  /**
   * JSON 파일로 다운로드
   */
  const downloadReport = (filename = 'image-performance-report.json') => {
    const report = getPerformanceReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return {
    measurements,
    measureImageLoad,
    getPerformanceReport,
    printPerformanceReport,
    clearMeasurements,
    downloadReport
  };
};
