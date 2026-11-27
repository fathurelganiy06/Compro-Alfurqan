import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { sanitizeSocialUrl } from '../types/cms';

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

interface SocialMediaFooterProps {
  institutionName: string;
  links: SocialMediaLinks;
}

interface SocialItem {
  id: 'instagram' | 'facebook' | 'twitter' | 'youtube';
  label: string;
  url: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const SocialMediaFooter: React.FC<SocialMediaFooterProps> = ({
  institutionName,
  links,
}) => {
  const candidates: SocialItem[] = [
    {
      id: 'instagram',
      label: 'Instagram',
      url: sanitizeSocialUrl(links.instagram),
      Icon: Instagram,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      url: sanitizeSocialUrl(links.facebook),
      Icon: Facebook,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      url: sanitizeSocialUrl(links.twitter),
      Icon: Twitter,
    },
    {
      id: 'youtube',
      label: 'YouTube',
      url: sanitizeSocialUrl(links.youtube),
      Icon: Youtube,
    },
  ];

  const activeProfiles = candidates.filter((item) => /^https?:\/\//i.test(item.url));

  if (activeProfiles.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-[#EDF1EE] bg-[#FAFBF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-[#4A5D54]">
          <span className="font-semibold text-[#0F1F18]">Kanal Resmi</span>
          <span aria-hidden="true"> · </span>
          <span>Ikuti informasi terbaru {institutionName} di media sosial</span>
        </div>

        <nav
          aria-label="Profil Media Sosial Resmi Kampus"
          className="flex flex-wrap items-center gap-2 sm:gap-3"
        >
          {activeProfiles.map(({ id, label, url, Icon }) => (
            <a
              key={id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${institutionName} di ${label}`}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#0F1F18] bg-white border border-[#D4DDD6] hover:border-[#0E5A36] hover:text-[#0E5A36] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5A36]"
            >
              <Icon className="w-3.5 h-3.5 text-[#0E5A36] shrink-0" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};
