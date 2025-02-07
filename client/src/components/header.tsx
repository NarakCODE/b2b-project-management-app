import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from './ui/separator';
import { Link, useLocation } from 'react-router-dom';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { ModeToggle } from './theme-toggle';
import {  Mail } from 'lucide-react';
import { Button } from './ui/button';
import Notification from './notification';

const Header = () => {
  const location = useLocation();
  const workspaceId = useWorkspaceId();

  const pathname = location.pathname;

  const getPageLabel = (pathname: string) => {
    if (pathname.includes('/project/')) return 'Project';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/tasks')) return 'Tasks';
    if (pathname.includes('/members')) return 'Members';
    return null; // Default label
  };

  const pageHeading = getPageLabel(pathname);
  return (
    <header className='flex sticky top-0 z-50 bg-background h-14 shrink-0 items-center border-b'>
      <div className='flex flex-1 items-center gap-2 px-3'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className='hidden md:block text-[15px]'>
              {pageHeading ? (
                <BreadcrumbLink asChild>
                  <Link to={`/workspace/${workspaceId}`}>Dashboard</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className='line-clamp-1 '>
                  Dashboard
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {pageHeading && (
              <>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem className='text-[15px]'>
                  <BreadcrumbPage className='line-clamp-1'>
                    {pageHeading}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className='mr-3'>
        <Notification />

        {/* Mail */}
        <Button variant='ghost' size='icon'>
          <Mail className='h-4 w-4' />
        </Button>

        {/* Theme toggle */}
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
