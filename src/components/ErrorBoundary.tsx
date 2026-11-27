import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      let displayDetail = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed && typeof parsed.error === 'string') {
          displayDetail = `${parsed.operationType?.toUpperCase() ?? 'DATA'} (${parsed.path ?? 'firestore'}): ${parsed.error}`;
        }
      } catch {
        // Plain error message
      }

      return (
        <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E2E8E2] rounded-xl p-8">
            <div className="flex items-center gap-3 text-[#0F1F18] mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <h2 className="text-xl font-semibold">Pemulihan Aplikasi</h2>
            </div>
            <p className="text-sm text-[#4A5D54] leading-relaxed mb-4">
              Portal mengalami kendala teknis atau izin data sementara. Anda dapat mencoba memuat
              ulang tampilan tanpa kehilangan data yang tersimpan.
            </p>
            <div className="bg-[#F2F5F1] border border-[#E2E8E2] rounded-lg p-3 text-xs font-mono text-[#0F1F18] break-words mb-6">
              {displayDetail}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-[#0F1F18] border border-[#D4DDD6] hover:bg-[#F2F5F1] rounded-lg transition-colors cursor-pointer"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
