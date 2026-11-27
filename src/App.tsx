/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LiveNotificationToast, NotificationCenter } from './components/NotificationCenter';
import { SiteSearchModal } from './components/SiteSearchModal';
import { UniversityPortal } from './components/UniversityPortal';
import { CampusProvider, useCampus } from './context/CampusContext';
import type { AcademicProgram, AgendaEvent, Post } from './types/cms';

const PortalShell: React.FC = () => {
  const { incrementPostView, trackInteraction } = useCampus();
  const [viewMode, setViewMode] = useState<'portal' | 'admin'>('portal');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mapsQuotaReached, setMapsQuotaReached] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaEvent | null>(null);

  // Listen for Case A Google Maps Platform Demo Key Quota Exceeded events
  useEffect(() => {
    const handleQuota = () => setMapsQuotaReached(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Global Cmd/Ctrl+K search shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setViewMode('portal');
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const jumpToSection = useCallback((sectionId: string) => {
    setViewMode('portal');
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  }, []);

  const handleOpenSearch = useCallback((initial = '') => {
    setSearchInitialQuery(initial);
    setSearchOpen(true);
  }, []);

  return (
    <>
      {mapsQuotaReached && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {viewMode === 'portal' ? (
        <UniversityPortal
          onOpenAdmin={() => setViewMode('admin')}
          onOpenSearch={handleOpenSearch}
          onOpenNotifications={() => setNotificationsOpen(true)}
          selectedProgram={selectedProgram}
          onSelectProgram={setSelectedProgram}
          selectedPost={selectedPost}
          onSelectPost={setSelectedPost}
          selectedAgenda={selectedAgenda}
          onSelectAgenda={setSelectedAgenda}
        />
      ) : (
        <AdminDashboard onBackToPortal={() => setViewMode('portal')} />
      )}

      <SiteSearchModal
        isOpen={searchOpen}
        initialQuery={searchInitialQuery}
        onClose={() => setSearchOpen(false)}
        onSelectProgram={(prog) => {
          trackInteraction('program_view', `${prog.code} ${prog.name}`);
          setViewMode('portal');
          setSelectedProgram(prog);
        }}
        onSelectPost={(post) => {
          incrementPostView(post);
          setViewMode('portal');
          setSelectedPost(post);
        }}
        onSelectAgenda={(evt) => {
          setViewMode('portal');
          setSelectedAgenda(evt);
        }}
        onJumpToSection={jumpToSection}
      />

      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigateSection={jumpToSection}
      />

      <LiveNotificationToast onOpenDrawer={() => setNotificationsOpen(true)} />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <CampusProvider>
        <PortalShell />
      </CampusProvider>
    </ErrorBoundary>
  );
}
