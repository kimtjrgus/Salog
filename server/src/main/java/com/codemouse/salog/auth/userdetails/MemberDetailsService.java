package com.codemouse.salog.auth.userdetails;

import com.codemouse.salog.auth.utils.CustomAuthorityUtils;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Optional;

@Component
@AllArgsConstructor
public class MemberDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;
    private final CustomAuthorityUtils customAuthorityUtils;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Member> optionalMember = memberRepository.findByEmail(username);
        Member findMember = optionalMember.orElseThrow(() -> new BusinessLogicException(ExceptionCode.MEMBER_NOT_FOUND));

        return new MemberDetails(findMember);
    }

    private final class MemberDetails extends Member implements UserDetails {

        public MemberDetails(Member member) {
            setMemberId(member.getMemberId());
            setEmail(member.getEmail());
            setPassword(member.getPassword());
            setRoles(member.getRoles());
        }

        // 롤 추가
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return customAuthorityUtils.createAuthorities(this.getRoles());
        }

        // 회원 이름 반환
        @Override
        public String getUsername() {
            return getEmail();
        }

        // 계정 만료 여부 - false 모든 계정 만료
        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        // 계정 잠금 여부 - false 모든 계정 잠금
        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        // 사용자 인증 정보 만료 여부 - false 모든 계정 만료
        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        // 계정 활성 상태 여부 - false 모든 계정 비활성
        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}
