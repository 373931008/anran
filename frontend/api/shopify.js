/**
 * Shopify API 工具函数
 * 封装常用的Shopify API调用和数据处理
 */

/**
 * 自定义API错误类
 */
export class ShopifyAPIError extends Error {
  constructor(message, status = 500, response = null) {
    super(message)
    this.name = 'ShopifyAPIError'
    this.status = status
    this.response = response
  }
}

/**
 * 基础API请求函数
 * @param {string} url - API端点URL
 * @param {Object} options - 请求选项
 * @returns {Promise<any>} API响应数据
 */
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }

  const config = { ...defaultOptions, ...options }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // 如果无法解析错误响应，使用默认错误信息
      }

      throw new ShopifyAPIError(errorMessage, response.status, response)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch (error) {
    if (error instanceof ShopifyAPIError) {
      throw error
    }

    // 网络错误或其他错误
    throw new ShopifyAPIError(`Network error: ${error.message}`, 0, null)
  }
}

/**
 * 购物车相关API
 */
export const cart = {
  /**
   * 获取购物车信息
   * @returns {Promise<Object>} 购物车数据
   */
  async get() {
    return await apiRequest('/cart.js')
  },

  /**
   * 添加商品到购物车
   * @param {Object} items - 商品信息
   * @returns {Promise<Object>} 更新后的购物车
   */
  async add(items) {
    const payload = Array.isArray(items) ? { items } : { ...items }

    return await apiRequest('/cart/add.js', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  /**
   * 更新购物车商品
   * @param {Object} updates - 更新信息
   * @returns {Promise<Object>} 更新后的购物车
   */
  async update(updates) {
    return await apiRequest('/cart/update.js', {
      method: 'POST',
      body: JSON.stringify({ updates })
    })
  },

  /**
   * 修改购物车商品数量
   * @param {string} key - 商品key
   * @param {number} quantity - 新数量
   * @returns {Promise<Object>} 更新后的购物车
   */
  async change(key, quantity) {
    return await apiRequest('/cart/change.js', {
      method: 'POST',
      body: JSON.stringify({ id: key, quantity })
    })
  },

  /**
   * 清空购物车
   * @returns {Promise<Object>} 空购物车
   */
  async clear() {
    return await apiRequest('/cart/clear.js', {
      method: 'POST'
    })
  }
}

/**
 * 产品相关API
 */
export const product = {
  /**
   * 获取产品信息
   * @param {string} handle - 产品handle
   * @returns {Promise<Object>} 产品数据
   */
  async get(handle) {
    return await apiRequest(`/products/${handle}.js`)
  },

  /**
   * 获取产品推荐
   * @param {string} productId - 产品ID
   * @param {number} limit - 推荐数量限制
   * @returns {Promise<Array>} 推荐产品列表
   */
  async getRecommendations(productId, limit = 4) {
    const url = `/recommendations/products.json?product_id=${productId}&limit=${limit}`
    const response = await apiRequest(url)
    return response.products || []
  }
}

/**
 * 搜索相关API
 */
export const search = {
  /**
   * 预测搜索
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async predictive(query, options = {}) {
    const { limit = 10, types = 'product,page,article,collection' } = options

    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      'resources[type]': types,
      'resources[options][unavailable_products]': 'last',
      'resources[options][fields]': 'title,product_type,variants.title,vendor'
    })

    return await apiRequest(`/search/suggest.json?${params}`)
  }
}

/**
 * 客户相关API（需要客户登录）
 */
export const customer = {
  /**
   * 获取客户地址
   * @returns {Promise<Array>} 地址列表
   */
  async getAddresses() {
    return await apiRequest('/account/addresses.json')
  },

  /**
   * 获取客户订单
   * @param {number} page - 页码
   * @returns {Promise<Object>} 订单数据
   */
  async getOrders(page = 1) {
    return await apiRequest(`/account/orders.json?page=${page}`)
  }
}

/**
 * 工具函数
 */
export const utils = {
  /**
   * 格式化商品价格
   * @param {number} cents - 价格（分）
   * @param {string} format - 格式化模板
   * @returns {string} 格式化后的价格
   */
  formatMoney(cents, format = '{{amount}}') {
    if (typeof cents !== 'number') {
      return ''
    }

    const value = (cents / 100).toFixed(2)
    return format.replace('{{amount}}', value)
  },

  /**
   * 获取商品图片URL
   * @param {string} src - 原始图片URL
   * @param {string} size - 图片尺寸
   * @returns {string} 处理后的图片URL
   */
  getImageUrl(src, size = 'master') {
    if (!src) return ''

    const extension = src.split('.').pop()
    return src.replace(`.${extension}`, `_${size}.${extension}`)
  },

  /**
   * 创建商品变体选择器
   * @param {Object} product - 产品数据
   * @returns {Object} 变体选择器配置
   */
  createVariantSelector(product) {
    const options = product.options || []
    const variants = product.variants || []

    return {
      options,
      variants,
      selectedVariant: variants[0] || null,

      selectVariant(optionValues) {
        return variants.find((variant) => {
          return variant.options.every((option, index) => {
            return option === optionValues[index]
          })
        })
      }
    }
  }
}
