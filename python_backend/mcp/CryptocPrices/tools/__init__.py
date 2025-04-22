try:
    # 当作为包的一部分导入时，使用相对导入
    from .current_price import get_current_price, get_multiple_prices
    from .history import get_price_history
    from .market import get_market_summary
    from .prediction import get_price_prediction
    from .comprehensive import get_comprehensive_analysis
except ImportError:
    # 当直接运行脚本时，尝试绝对导入
    from current_price import get_current_price, get_multiple_prices
    from history import get_price_history
    from market import get_market_summary
    from prediction import get_price_prediction
    from comprehensive import get_comprehensive_analysis

__all__ = [
    'get_current_price',
    'get_multiple_prices',
    'get_price_history',
    'get_market_summary',
    'get_price_prediction',
    'get_comprehensive_analysis'
]
