/* Makes [rollback] links for edits excecute without an additional page load. Including self-closing bookmarklet option.
 * @see: [[bugzilla:31270]]
 * @author: [[w:en:User:Gracenotes]]
 * @author: [[meta:User:Krinkle]]
 * @author: [[User:Helder.wiki]]
 * @source: Based on [[meta:User:Krinkle/Scripts/AjaxPatrolLinks.js]] and [[w:en:User:Gracenotes/rollback.js]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/AjaxRollbackLinks.js]] ([[File:User:Helder.wiki/Tools/AjaxRollbackLinks.js]])
 * FIXME: Use MediaWiki API
 */
function ajaxRollback() {
	var	$rollbackLinks = $('.mw-rollback-link a'),
		prevUser,
		rollbackSummaryDefault;
	function useAJAX(e) {
		e.preventDefault();
		var $this = $(this);
		var href = $this.attr( 'href' ) + '&bot=1';
		$this.text('Rolling back...');
		$rollbackLinks = $this.parent();
		$.get(
			href,
			null,
			function( data, status, request ) {
				if ( status == 'success' ) {
					$this.html('<span style="color:green">Rolled back</span>');
				} else {
					$this.html('<span style="color:red">Rollback failed</span>');// MediaWiki:Rollbackfailed
				}
			}
		);
	}
	if ( $rollbackLinks.length > 0 ) {
		rollbackSummaryDefault = 'Foram revertidas as edições de $user';
		prevUser = $('#mw-diff-otitle2').find('a').first().text();
		if ( prevUser ) {
			rollbackSummaryDefault += ', com o conteúdo passando a estar como na última edição de ' + prevUser;
		}
		rollbackSummaryDefault += '.';
		$rollbackLinks.each(function(){
			var $this = $(this);
			$this.after(
				$this.clone()
				.text('+sum')
				.attr( 'class', '')
				.click(function confirmRollback( e ) {
					var	url = this.href,
						user = url.match( /[?&]from=([^&]*)/ );
					e.preventDefault();
					if ( !user ) {
						return;
					}
					user = decodeURIComponent( user[1].replace(/\+/g, ' ') );
					var extraSum = prompt(
						'Informe mais detalhes sobre o motivo desta reversão.\n\n' +
						'Deixe em branco para utilizar o padrão.' +
						' $user será trocado por "' + user + '".'
					);
					if (extraSum === null){
						return;
					} else if (extraSum === ''){
						useAJAX.call(this, e);
					}
					this.href += "&summary=" + encodeURIComponent(
						(rollbackSummaryDefault + ' ' + extraSum).replace( /\$user/g, user )
					);
					useAJAX.call(this, e);
				} )
			).after( ' | ' )
			.click( useAJAX );
		});
	}
}
$(ajaxRollback);