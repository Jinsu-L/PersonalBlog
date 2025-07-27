import styled from "@emotion/styled"
import Link from "next/link"
import { FaRss } from "react-icons/fa"

const NavBar: React.FC = () => {
  const links = [{ id: 1, name: "About", to: "/about" }]
  return (
    <StyledWrapper className="">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <Link href={link.to}>{link.name}</Link>
          </li>
        ))}
        <li>
          <Link href="/api/rss.xml" aria-label="RSS Feed">
            <FaRss />
          </Link>
        </li>
      </ul>
    </StyledWrapper>
  )
}

export default NavBar

const StyledWrapper = styled.div`
  flex-shrink: 0;
  ul {
    display: flex;
    flex-direction: row;
    align-items: center;
    li {
      display: block;
      margin-left: 1rem;
      color: ${({ theme }) => theme.colors.gray11};
      
      a {
        display: flex;
        align-items: center;
        color: inherit;
        text-decoration: none;
        transition: color 0.2s ease;
        
        &:hover {
          color: ${({ theme }) => theme.colors.gray12};
        }
        
        svg {
          font-size: 1rem;
        }
      }
    }
  }
`
